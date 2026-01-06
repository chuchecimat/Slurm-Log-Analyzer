import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SlurmJob } from './types';
import { fetchSlurmData } from './services/dataService';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import Dashboard from './components/Dashboard';
import { TimeRange } from './components/TimeRangeFilter';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<SlurmJob[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSlurmData();
      setJobs(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return null;
    if (timeRange === 'all') return jobs;

    const now = new Date();
    // Start of today (00:00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isAfter = (date: Date, daysAgo: number) => {
        const comparisonDate = new Date();
        comparisonDate.setDate(now.getDate() - daysAgo);
        comparisonDate.setHours(0,0,0,0); // Start of that day
        return date >= comparisonDate;
    };

    switch (timeRange) {
        case 'today':
            return jobs.filter(job => job.start >= startOfToday);
        case 'yesterday': {
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfToday.getDate() - 1);
            return jobs.filter(job => job.start >= startOfYesterday && job.start < startOfToday);
        }
        case 'week':
            // Today + 6 previous days = 7 days total
            return jobs.filter(job => isAfter(job.start, 6));
        case 'month':
            return jobs.filter(job => isAfter(job.start, 30));
        case 'year':
            return jobs.filter(job => isAfter(job.start, 365));
        default:
            return jobs;
    }
  }, [jobs, timeRange]);

  const renderContent = () => {
    if (loading) {
      return <Loader />;
    }
    if (error) {
      return <ErrorDisplay message={error} />;
    }
    if (filteredJobs) {
      return <Dashboard jobs={filteredJobs} timeRange={timeRange} onTimeRangeChange={setTimeRange} onReset={loadData} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main>{renderContent()}</main>
    </div>
  );
};

export default App;