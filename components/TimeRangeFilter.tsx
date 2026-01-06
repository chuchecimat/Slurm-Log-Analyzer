import React from 'react';

export type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all';

const ranges: { key: TimeRange; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'Last Week' },
    { key: 'month', label: 'Last Month' },
    { key: 'year', label: 'Last Year' },
    { key: 'all', label: 'All Time' },
];

interface TimeRangeFilterProps {
    activeRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
}

const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({ activeRange, onRangeChange }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-8">
            {ranges.map(({ key, label }) => {
                const isActive = activeRange === key;
                const baseClasses = "px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500";
                const activeClasses = "bg-cyan-500 text-white";
                const inactiveClasses = "bg-slate-700 text-slate-300 hover:bg-slate-600";
                return (
                    <button
                        key={key}
                        onClick={() => onRangeChange(key)}
                        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

export default TimeRangeFilter;
