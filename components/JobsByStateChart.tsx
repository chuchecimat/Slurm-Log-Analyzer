import React, { useMemo } from 'react';
import { SlurmJob } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface JobsByStateChartProps {
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

const COLORS = ['#22c55e', '#ef4444', '#f97316', '#3b82f6', '#eab308', '#a855f7', '#64748b'];

const JobsByStateChart: React.FC<JobsByStateChartProps> = ({ jobs }) => {
    const data = useMemo(() => {
        const stateCounts = jobs.reduce<Record<string, number>>((acc, job) => {
            acc[job.state] = (acc[job.state] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(stateCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => a.value - b.value); // Sort ascending for horizontal bar chart
    }, [jobs]);

    return (
        <ChartContainer title="Job Status Distribution">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={data} 
                    layout="vertical" 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tick={{ fill: '#94a3b8' }} 
                        width={80} 
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{fill: '#33415580'}}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                        labelStyle={{ color: '#cbd5e1' }}
                        formatter={(value: number) => [value, 'Jobs']}
                    />
                    <Bar dataKey="value" name="Job Count" barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default JobsByStateChart;