import React, { useMemo, useState } from 'react';
import { SlurmJob } from '../types';
import StatCard from './StatCard';
import JobsByUserChart from './JobsByUserChart';
import JobsByStateChart from './JobsByStateChart';
import JobsOverTimeChart from './JobsOverTimeChart';
import UserStats from './UserStats';
import { JobsTable } from './JobsTable';
import { SqueueTable } from './SqueueTable';
import { UserGroupIcon, ClockIcon, ServerStackIcon, CheckCircleIcon } from './icons';
import TimeRangeFilter, { TimeRange } from './TimeRangeFilter';

interface DashboardProps {
  jobs: SlurmJob[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onReset: () => void;
}

const formatSeconds = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return 'N/A';
  }
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  if (result === '') return '0m';

  return result.trim();
};

const Dashboard: React.FC<DashboardProps> = ({ jobs, timeRange, onTimeRangeChange, onReset }) => {
  const [userQuery, setUserQuery] = useState('*');

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const uniqueUsers = new Set(jobs.map(j => j.user)).size;
    const completedJobs = jobs.filter(j => j.state === 'COMPLETED').length;
    const totalElapsedSeconds = jobs.reduce((acc, j) => acc + j.elapsedSeconds, 0);
    const avgRuntime = totalJobs > 0 ? totalElapsedSeconds / totalJobs : 0;

    return {
      totalJobs,
      uniqueUsers,
      completedJobs,
      avgRuntime: formatSeconds(avgRuntime),
    };
  }, [jobs]);

  // Filter jobs for both UserStats and JobsTable based on the userQuery
  const filteredByUserJobs = useMemo(() => {
    const trimmedQuery = userQuery.trim().toLowerCase();
    
    // If query is empty, UserStats usually prompts to enter user. 
    // We return empty array here to be consistent, or all jobs? 
    // UserStats default is '*' which shows all. If user clears it, it shows prompt.
    if (!trimmedQuery) return []; 

    if (trimmedQuery === '*') return jobs;

    if (trimmedQuery.endsWith('*')) {
        const prefix = trimmedQuery.slice(0, -1);
        return jobs.filter(job => job.user.toLowerCase().startsWith(prefix));
    } else {
        return jobs.filter(job => job.user.toLowerCase() === trimmedQuery);
    }
  }, [jobs, userQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Slurm Log Analyzer</h1>
            <p className="text-slate-400 mt-1">Analyzing local log file data.</p>
        </div>
        <button 
            onClick={onReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
        >
            Load New Log File
        </button>
      </header>
      
      {/* Live Queue Table - Always visible as it fetches independently */}
      <SqueueTable />

      <div className="my-8 border-t border-slate-700/50"></div>
      
      <TimeRangeFilter activeRange={timeRange} onRangeChange={onTimeRangeChange} />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Jobs" value={stats.totalJobs.toLocaleString()} icon={<ServerStackIcon />} />
        <StatCard title="Unique Users" value={stats.uniqueUsers.toLocaleString()} icon={<UserGroupIcon />} />
        <StatCard title="Completed Jobs" value={stats.completedJobs.toLocaleString()} icon={<CheckCircleIcon />} />
        <StatCard title="Avg. Runtime" value={stats.avgRuntime} icon={<ClockIcon />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <JobsByUserChart jobs={jobs} />
        </div>
        <div className="lg:col-span-2">
            <JobsByStateChart jobs={jobs} />
        </div>
        <div className="lg:col-span-5">
            <JobsOverTimeChart jobs={jobs} />
        </div>
      </section>
      
      <section className="mt-8">
        <UserStats 
            jobs={filteredByUserJobs} 
            query={userQuery} 
            onQueryChange={setUserQuery} 
        />
      </section>

      <section className="mt-8">
        <JobsTable jobs={filteredByUserJobs} />
      </section>
    </div>
  );
};

export default Dashboard;