import React, { useMemo } from 'react';
import { SlurmJob } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface JobsOverTimeChartProps {
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


const JobsOverTimeChart: React.FC<JobsOverTimeChartProps> = ({ jobs }) => {
    const data = useMemo(() => {
        const jobsByDate = jobs.reduce<Record<string, number>>((acc, job) => {
            if (job.start && !isNaN(job.start.getTime())) {
                const date = job.start.toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
            }
            return acc;
        }, {});

        return Object.entries(jobsByDate)
            .map(([date, count]) => ({ date, jobs: count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [jobs]);

    return (
        <ChartContainer title="Jobs Submitted Over Time">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 0,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }}/>
                    <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                        labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Legend wrapperStyle={{color: '#cbd5e1'}} />
                    <Line type="monotone" dataKey="jobs" stroke="#34d399" strokeWidth={2} name="Submitted Jobs" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default JobsOverTimeChart;
