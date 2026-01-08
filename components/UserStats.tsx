import React, { useMemo } from 'react';
import { SlurmJob } from '../types';
import { UserCircleIcon, ServerStackIcon, ClockIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface UserStatsProps {
    jobs: SlurmJob[];
    query: string;
    onQueryChange: (query: string) => void;
}

const formatSeconds = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return 'N/A';
    }
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
  
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (result === '' && seconds >= 0) result += `${seconds}s`;

    return result.trim() || '0s';
};

const STATE_COLORS = {
    COMPLETED: '#22c55e',
    FAILED: '#ef4444',
    CANCELLED: '#f97316',
    TIMEOUT: '#eab308',
    NODE_FAIL: '#a855f7',
    RUNNING: '#3b82f6',
};
const statesToTrack: (keyof typeof STATE_COLORS)[] = ['COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT', 'NODE_FAIL', 'RUNNING'];

const UserStats: React.FC<UserStatsProps> = ({ jobs, query, onQueryChange }) => {

    const { stats, userJobDistribution, partitionDistribution } = useMemo(() => {
        // jobs passed in are already filtered by the query in the parent component.
        if (jobs.length === 0) {
            return { stats: null, userJobDistribution: [], partitionDistribution: [] };
        }

        const totalJobs = jobs.length;
        const totalElapsedSeconds = jobs.reduce((acc, j) => acc + j.elapsedSeconds, 0);
        const avgRuntime = totalJobs > 0 ? totalElapsedSeconds / totalJobs : 0;

        const usersData = jobs.reduce<Record<string, any>>((acc, job) => {
            const user = job.user;
            if (!acc[user]) {
                acc[user] = { user, totalJobs: 0 };
                statesToTrack.forEach(s => { acc[user][s] = 0; });
            }
            acc[user].totalJobs += 1;
            if (statesToTrack.includes(job.state as keyof typeof STATE_COLORS)) {
                acc[user][job.state] += 1;
            }
            return acc;
        }, {});
        
        const partitionCounts = jobs.reduce<Record<string, number>>((acc, job) => {
            acc[job.partition] = (acc[job.partition] || 0) + 1;
            return acc;
        }, {});

        const distribution = Object.values(usersData).sort((a, b) => b.totalJobs - a.totalJobs);
        const partDistribution = Object.entries(partitionCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);


        return {
            stats: {
                totalJobs,
                totalRuntime: formatSeconds(totalElapsedSeconds),
                avgRuntime: formatSeconds(avgRuntime),
            },
            userJobDistribution: distribution,
            partitionDistribution: partDistribution,
        };
    }, [jobs]);

    const renderContent = () => {
        if (!query.trim()) {
            return <p className="text-slate-400 text-center mt-8">Enter a username to see their stats. Use * as a wildcard (e.g., proy*).</p>;
        }
        if (!stats) {
            return <p className="text-slate-400 text-center mt-8">No jobs found for this query.</p>;
        }
        return (
            <div className="mt-6 animate-fade-in">
                {/* Row 1: Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center space-x-4">
                        <div className="bg-slate-700 p-3 rounded-full"><ServerStackIcon className="w-6 h-6 text-indigo-400"/></div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Jobs</p>
                            <p className="text-white text-xl font-bold">{stats.totalJobs.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center space-x-4">
                        <div className="bg-slate-700 p-3 rounded-full"><ClockIcon className="w-6 h-6 text-green-400" /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Runtime</p>
                            <p className="text-white text-xl font-bold">{stats.totalRuntime}</p>
                        </div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center space-x-4">
                        <div className="bg-slate-700 p-3 rounded-full"><ClockIcon className="w-6 h-6 text-yellow-400" /></div>
                        <div>
                            <p className="text-slate-400 text-sm">Avg. Runtime</p>
                            <p className="text-white text-xl font-bold">{stats.avgRuntime}</p>
                        </div>
                    </div>
                </div>

                {/* Row 2: Charts */}
                <div className="grid grid-cols-1 gap-6 mt-6">
                    {userJobDistribution.length > 0 && (
                        <div className="bg-slate-700/50 p-4 rounded-lg h-[500px]">
                            <h3 className="text-white font-semibold mb-2">User Job Breakdown by Status</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userJobDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="user" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} angle={-35} textAnchor="end" height={80} interval={0}/>
                                    <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                                    <Tooltip
                                        cursor={{fill: '#33415580'}}
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                    />
                                    <Legend wrapperStyle={{color: '#cbd5e1', paddingTop: '20px'}}/>
                                    <Bar dataKey="COMPLETED" stackId="a" name="Completed" fill={STATE_COLORS.COMPLETED} />
                                    <Bar dataKey="FAILED" stackId="a" name="Failed" fill={STATE_COLORS.FAILED} />
                                    <Bar dataKey="CANCELLED" stackId="a" name="Cancelled" fill={STATE_COLORS.CANCELLED} />
                                    <Bar dataKey="TIMEOUT" stackId="a" name="Timeout" fill={STATE_COLORS.TIMEOUT} />
                                    <Bar dataKey="NODE_FAIL" stackId="a" name="Node Fail" fill={STATE_COLORS.NODE_FAIL} />
                                    <Bar dataKey="RUNNING" stackId="a" name="Running" fill={STATE_COLORS.RUNNING} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                     {partitionDistribution.length > 0 && (
                        <div className="bg-slate-700/50 p-4 rounded-lg h-[400px]">
                            <h3 className="text-white font-semibold mb-2">Job Distribution by Partition</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={partitionDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                                    <Tooltip
                                        cursor={{fill: '#33415580'}}
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                    />
                                    <Bar dataKey="value" name="Job Count" fill="#818cf8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
            <h2 className="text-white text-xl font-semibold mb-4">User-Specific Statistics</h2>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircleIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Search for a user or use * as a wildcard (e.g., proy*)"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                />
            </div>
            {renderContent()}
        </div>
    );
};

export default UserStats;