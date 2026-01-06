export interface SlurmJob {
  jobId: number;
  user: string;
  start: Date;
  end: Date;
  partition: string;
  state: string;
  nodeList: string;
  elapsedSeconds: number;
}

export interface SqueueJob {
  jobId: string;
  partition: string;
  name: string;
  user: string;
  state: string;
  time: string;
  nodes: number;
  nodelist: string;
}

export interface StatSummary {
  totalJobs: number;
  uniqueUsers: number;
  completedJobs: number;
  failedJobs: number;
  avgDuration: number;
}