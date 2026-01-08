import React, { useState, useEffect, useCallback } from 'react';
import { SqueueJob } from '../types';
import { fetchSqueueData } from '../services/dataService';
import { RefreshIcon } from './icons';

export const SqueueTable: React.FC = () => {
    const [jobs, setJobs] = useState<SqueueJob[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchSqueueData();
            setJobs(data);
            setLastUpdated(new Date());
            // Reset to page 1 on new data? Optional, but safer.
            // setCurrentPage(1); 
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalPages = Math.ceil(jobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentJobs = jobs.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-800 to-slate-900">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-green-500/10 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Live Queue</h3>
                        <p className="text-xs text-slate-400">
                            {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Fetching...'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="text-xs text-slate-400 hidden sm:inline-block">
                        Showing {jobs.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, jobs.length)} of {jobs.length}
                    </span>
                    <button 
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-cyan-400 rounded-lg text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50 active:scale-95"
                    >
                        <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4">JobID</th>
                            <th className="p-4">Partition</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">User</th>
                            <th className="p-4">State</th>
                            <th className="p-4">Time</th>
                            <th className="p-4">Nodes</th>
                            <th className="p-4">NodeList</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-sm text-slate-300">
                        {currentJobs.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                                    {loading ? 'Checking queue...' : 'No running jobs found or unable to fetch queue data.'}
                                </td>
                            </tr>
                        ) : (
                            currentJobs.map((job) => (
                                <tr key={job.jobId} className="hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-mono text-cyan-400">{job.jobId}</td>
                                    <td className="p-4"><span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">{job.partition}</span></td>
                                    <td className="p-4 font-medium text-white">{job.name}</td>
                                    <td className="p-4 text-slate-400">{job.user}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${job.state === 'R' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'}`}>
                                            {job.state === 'R' ? 'RUNNING' : job.state}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-xs">{job.time}</td>
                                    <td className="p-4">{job.nodes}</td>
                                    <td className="p-4 font-mono text-xs text-slate-500">{job.nodelist}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium border border-slate-600"
                    >
                        Previous
                    </button>
                    <span className="text-slate-400 text-sm py-2">
                        Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium border border-slate-600"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};