import React, { useState } from 'react';
import { SlurmJob } from '../types';

interface JobsTableProps {
    jobs: SlurmJob[];
}

export const JobsTable: React.FC<JobsTableProps> = ({ jobs }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Sort jobs by start time descending by default (newest first)
    const sortedJobs = [...jobs].sort((a, b) => b.start.getTime() - a.start.getTime());

    const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentJobs = sortedJobs.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDuration = (seconds: number) => {
         const h = Math.floor(seconds / 3600);
         const m = Math.floor((seconds % 3600) / 60);
         const s = Math.floor(seconds % 60);
         return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Job History</h2>
                <div className="text-sm text-slate-400">
                    Showing {jobs.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, jobs.length)} of {jobs.length} jobs
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4">Job ID</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Partition</th>
                            <th className="p-4">State</th>
                            <th className="p-4">Start Time</th>
                            <th className="p-4">End Time</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4">Nodes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-sm text-slate-300">
                        {currentJobs.map((job) => (
                            <tr key={job.jobId} className="hover:bg-slate-700/50 transition-colors">
                                <td className="p-4 font-mono text-cyan-400">{job.jobId}</td>
                                <td className="p-4 font-medium text-white">{job.user}</td>
                                <td className="p-4"><span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300 border border-slate-600">{job.partition}</span></td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border 
                                        ${job.state === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                          job.state === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                          job.state === 'CANCELLED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                          job.state === 'TIMEOUT' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                          'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                        {job.state}
                                    </span>
                                </td>
                                <td className="p-4 whitespace-nowrap text-xs text-slate-400">{job.start.toLocaleString()}</td>
                                <td className="p-4 whitespace-nowrap text-xs text-slate-400">{job.end.toLocaleString()}</td>
                                <td className="p-4 font-mono text-xs">{formatDuration(job.elapsedSeconds)}</td>
                                <td className="p-4 font-mono text-xs text-slate-500 max-w-xs truncate" title={job.nodeList}>{job.nodeList}</td>
                            </tr>
                        ))}
                         {currentJobs.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-500 italic">No jobs found matching current filters.</td>
                            </tr>
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