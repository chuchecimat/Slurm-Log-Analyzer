
import React, { useMemo } from 'react';
import { SlurmJob } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface JobsByUserChartProps {
  jobs: SlurmJob[];
}

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg h-96 flex flex-col">
        <h2 className="text-white text-lg font-semibold mb-4">{title}</h2>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const JobsByUserChart: React.FC<JobsByUserChartProps> = ({ jobs }) => {
  const data = useMemo(() => {
    const userCounts = jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.user] = (acc[job.user] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(userCounts)
      .map(([user, count]) => ({ user, jobs: count }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 15); // Show top 15 users for clarity
  }, [jobs]);

  return (
    <ChartContainer title="Jobs per User (Top 15)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="user" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
          <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            labelStyle={{ color: '#cbd5e1' }}
          />
          <Legend wrapperStyle={{color: '#cbd5e1'}}/>
          <Bar dataKey="jobs" fill="#22d3ee" name="Job Count"/>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default JobsByUserChart;
