'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Activity, Dumbbell, Clock, Flame
} from 'lucide-react';
import type { DashboardOverview as DashboardOverviewType } from '@/types/dashboard';

export default function DashboardOverview() {
  const [overview, setOverview] = useState<DashboardOverviewType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/overview', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setOverview(data);
      } catch (err) {
        console.error('Error fetching dashboard overview:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-lg p-4 my-4">
        <p className="font-medium mb-1">Error Loading Dashboard</p>
        <p className="text-sm">{error || 'Failed to load dashboard data'}</p>
      </div>
    );
  }

  // Helper function to capitalize first letter of each word
  const capitalize = (str: string) => {
    return str.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format activity duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="w-full max-w-none px-0 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/20 p-2 rounded-md">
            <BarChart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Dashboard Overview</h1>
            <p className="text-gray-400 text-xs">
              Your fitness journey at a glance
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {overview.activitySummary.periodLabel}
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="bg-black/40 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {overview.profile.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{overview.profile.name}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                {capitalize(overview.profile.fitnessLevel)}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {capitalize(overview.profile.activityLevel)}
              </span>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="flex flex-wrap gap-1 mb-4">
          {overview.profile.fitnessGoals.map((goal, i) => (
            <span 
              key={i} 
              className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
            >
              {capitalize(goal)}
            </span>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-black/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-medium text-sm">Activity Summary</h3>
          </div>
          <span className="text-primary text-xs font-medium">
            {overview.userStats.totalWorkouts} Total
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-black/40 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Workout Time</p>
            <p className="text-base font-bold">
              {formatDuration(overview.activitySummary.stats.workoutTime.total)}
            </p>
          </div>
          <div className="bg-black/40 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Calories</p>
            <p className="text-base font-bold">
              {overview.activitySummary.stats.caloriesBurned.total} kcal
            </p>
          </div>
          <div className="bg-black/40 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Activities</p>
            <p className="text-base font-bold">
              {overview.activitySummary.stats.activityCount.total}
            </p>
          </div>
        </div>

        {/* Top Activities */}
        <h4 className="text-xs font-medium text-gray-400 mb-2">Top Activities</h4>
        <div className="space-y-2">
          {overview.activitySummary.topActivities.map((activity, i) => (
            <div key={i} className="bg-black/40 rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 h-8 w-8 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium truncate max-w-[150px]">
                    {activity.title.length > 30 
                      ? activity.title.split(':')[1] || activity.title 
                      : activity.title}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {formatDuration(activity.duration)}
                    <span className="mx-1">•</span>
                    <Flame className="w-3 h-3" /> {activity.calories} kcal
                  </p>
                </div>
              </div>
              <span className="bg-primary/10 text-primary text-xs px-2 rounded-full">
                x{activity.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 