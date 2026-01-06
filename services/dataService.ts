import { SlurmJob, SqueueJob } from '../types';

// To ensure reliability, the application expects 'all_data.log' to be in the same public directory as index.html.
const DATA_URL = 'all_data.log';
const SQUEUE_URL = 'squeue.txt';

export const fetchSlurmData = async (): Promise<SlurmJob[]> => {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
       if (response.status === 404) {
        throw new Error(`Failed to find '${DATA_URL}'. Please make sure the log file is placed in the same directory as the application's index.html on your web server.`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const text = decoder.decode(buffer);

    const lines = text.trim().split('\n');

    if (lines.length < 2) {
      return [];
    }

    const headerLine = lines.shift();
    if (!headerLine) return [];
    
    const headers = headerLine.trim().split('|').map(h => h.trim());
    const getIndex = (name: string, required = true) => {
        const index = headers.indexOf(name);
        if (index === -1 && required) throw new Error(`Header '${name}' not found in log file.`);
        return index;
    };

    const indices = {
        jobID: getIndex('JobIDRaw'),
        user: getIndex('User'),
        start: getIndex('Start'),
        end: getIndex('End'),
        partition: getIndex('Partition'),
        state: getIndex('State'),
        nodeList: getIndex('NodeList', false), // Make NodeList optional
    };
    
    return lines.map(line => {
      const values = line.split('|');
      // A more robust check for line length
      if (values.length < headers.filter(h => getIndex(h, false) !== -1).length) return null;

      const state = values[indices.state].split(' ')[0]; // Handle states like 'COMPLETED by 12345'
      const startDate = new Date(values[indices.start]);
      const endDate = new Date(values[indices.end]);

      let elapsedSeconds = 0;
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          elapsedSeconds = (endDate.getTime() - startDate.getTime()) / 1000;
      }
      
      return {
        jobId: parseInt(values[indices.jobID], 10) || 0,
        user: values[indices.user],
        start: startDate,
        end: endDate,
        partition: values[indices.partition],
        state: state,
        nodeList: indices.nodeList !== -1 ? values[indices.nodeList] : 'N/A',
        elapsedSeconds: Math.max(0, elapsedSeconds),
      };
    }).filter((job): job is SlurmJob => job !== null);

  } catch (error) {
    console.error('Failed to fetch or parse Slurm data:', error);
    let errorMessage = 'Failed to load data. ';
    if (error instanceof TypeError) {
      errorMessage += 'There might be a network issue. Please check your connection.';
    } else if (error instanceof Error) {
      errorMessage += error.message;
    }
    throw new Error(errorMessage);
  }
};

export const fetchSqueueData = async (): Promise<SqueueJob[]> => {
    try {
        const response = await fetch(SQUEUE_URL);
        if (!response.ok) {
             console.warn(`Squeue file not found at ${SQUEUE_URL}`);
             return [];
        }
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        // Remove header line if it exists (starts with JOBID)
        const dataLines = lines.filter(line => !line.trim().startsWith('JOBID'));

        return dataLines.map(line => {
            // Split by whitespace
            const parts = line.trim().split(/\s+/);
            if (parts.length < 8) return null;

            // Format: JOBID PARTITION NAME USER ST TIME NODES NODELIST(REASON)
            // Indices: 0     1         2    3    4  5    6     7
            
            return {
                jobId: parts[0],
                partition: parts[1],
                name: parts[2],
                user: parts[3],
                state: parts[4],
                time: parts[5],
                nodes: parseInt(parts[6], 10) || 0,
                nodelist: parts.slice(7).join(' ') // Join rest as nodelist in case of spaces
            };
        }).filter((job): job is SqueueJob => job !== null);

    } catch (error) {
        console.error("Error fetching squeue data", error);
        return [];
    }
};