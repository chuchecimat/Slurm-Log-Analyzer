
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full animate-spin border-t-transparent"></div>
      <p className="mt-4 text-slate-300 text-lg">Loading Slurm Data...</p>
    </div>
  );
};

export default Loader;
