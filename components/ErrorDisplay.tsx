
import React from 'react';
import { WarningIcon } from './icons';

interface ErrorDisplayProps {
  message: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-slate-800 border border-red-500/50 rounded-xl p-8 max-w-2xl w-full text-center shadow-lg">
        <div className="mx-auto bg-red-500/10 rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <WarningIcon className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Data Fetching Failed</h2>
        <p className="text-slate-300">
          {message || 'An unexpected error occurred. Please try again later.'}
        </p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
