'use client';

import { useEffect, useState } from 'react';
import { Activity, Moon, Utensils, BarChart, Calendar, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LegendProps } from 'recharts';

interface ActivitySummary {
  period: string;
  periodLabel: string;
  stats: {
    workoutTime: { total: number; unit: string; change: number };
    caloriesBurned: { total: number; unit: string; change: number };
    activityCount: { total: number; change: number };
  };
  topActivities: any[];
}

interface SleepSummary {
  period: string;
  periodLabel: string;
  stats: {
    avgDuration: { value: number; unit: string; change: number };
    avgRating: { value: number; scale: string; change: number };
    consistency: { value: number; unit: string };
  };
  qualityDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    veryPoor: number;
  };
}

interface NutritionSummary {
  period: string;
  periodLabel: string;
  stats: {
    calories: { total: number; average: number; unit: string; change: number };
    protein: { total: number; average: number; unit: string; change: number; percentage: number };
    carbs: { total: number; average: number; unit: string; change: number; percentage: number };
    fats: { total: number; average: number; unit: string; change: number; percentage: number };
  };
  macroDistribution: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

type Period = 'daily' | 'weekly' | 'monthly';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B']; // Blue for protein, Green for carbs, Orange for fats

export default function UserStats() {
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [sleepSummary, setSleepSummary] = useState<SleepSummary | null>(null);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('daily');

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        // Only show full loading screen on initial load
        if (!activitySummary && !sleepSummary && !nutritionSummary) {
          setLoading(true);
        } else {
          // Otherwise, just indicate updating
          setIsUpdating(true);
        }
        
        // Fetch all summaries in parallel
        const [activityRes, sleepRes, nutritionRes] = await Promise.all([
          fetch(`/api/dashboard?type=activity-summary&period=${period}`, { credentials: 'include' }),
          fetch(`/api/dashboard?type=sleep-summary&period=${period}`, { credentials: 'include' }),
          fetch(`/api/dashboard?type=nutrition-summary&period=${period}`, { credentials: 'include' })
        ]);

        // Handle activity summary
        if (!activityRes.ok) {
          throw new Error(`Failed to fetch activity summary: ${activityRes.status}`);
        }
        const activityData = await activityRes.json();
        setActivitySummary(activityData);

        // Handle sleep summary
        if (!sleepRes.ok) {
          throw new Error(`Failed to fetch sleep summary: ${sleepRes.status}`);
        }
        const sleepData = await sleepRes.json();
        setSleepSummary(sleepData);

        // Handle nutrition summary
        if (!nutritionRes.ok) {
          throw new Error(`Failed to fetch nutrition summary: ${nutritionRes.status}`);
        }
        const nutritionData = await nutritionRes.json();
        setNutritionSummary(nutritionData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    };

    fetchSummaries();
  }, [period]);

  const renderMacroPieChart = (nutritionSummary: NutritionSummary) => {
    const data = [
      { name: 'Protein', value: nutritionSummary.stats.protein.percentage },
      { name: 'Carbs', value: nutritionSummary.stats.carbs.percentage },
      { name: 'Fats', value: nutritionSummary.stats.fats.percentage }
    ];

    return (
      <div className="h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} strokeWidth={0} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: any) => `${value} ${entry.payload?.value}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-0">
      {/* Period Selection - Full Width with reduced height */}
      <div className="flex overflow-x-auto bg-black/40 p-0.5 rounded-xl mb-4 w-full no-scrollbar">
        <button
          onClick={() => setPeriod('daily')}
          className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            period === 'daily' 
              ? 'bg-primary text-white' 
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
          disabled={isUpdating}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily</span>
        </button>
        <button
          onClick={() => setPeriod('weekly')}
          className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            period === 'weekly' 
              ? 'bg-primary text-white' 
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
          disabled={isUpdating}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Weekly</span>
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            period === 'monthly' 
              ? 'bg-primary text-white' 
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
          disabled={isUpdating}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Monthly</span>
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-black/40 border border-white/5 rounded-xl p-2 sm:p-3 w-full mx-0">
        {/* Summary Sections - Full Width Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {/* Workout Summary */}
          <div className="bg-black/60 border border-white/5 rounded-lg p-4 w-full relative">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Workout</h3>
            </div>
            {activitySummary ? (
              <div className={`space-y-3 transition-opacity duration-300 ${isUpdating ? 'opacity-50' : ''}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Workout Time</p>
                    <p className="text-lg font-semibold text-white">
                      {activitySummary.stats.workoutTime.total} {activitySummary.stats.workoutTime.unit}
                    </p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Calories Burned</p>
                    <p className="text-lg font-semibold text-white">
                      {activitySummary.stats.caloriesBurned.total} {activitySummary.stats.caloriesBurned.unit}
                    </p>
                  </div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Activities</p>
                  <p className="text-lg font-semibold text-white">{activitySummary.stats.activityCount.total}</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">Loading workout data...</div>
            )}
            {isUpdating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-lg transition-opacity duration-300">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Nutrition Summary */}
          <div className="bg-black/60 border border-white/5 rounded-lg p-4 w-full relative">
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Nutrition</h3>
            </div>
            {nutritionSummary ? (
              <div className={`transition-opacity duration-300 ${isUpdating ? 'opacity-50' : ''}`}>
                <div className="bg-black/40 p-3 rounded-lg mb-3">
                  <p className="text-xs text-gray-400">Calories</p>
                  <p className="text-lg font-semibold text-white">
                    {nutritionSummary.stats.calories.total} {nutritionSummary.stats.calories.unit}
                  </p>
                </div>
                <div className="bg-black/40 rounded-lg p-2">
                  {renderMacroPieChart(nutritionSummary)}
                </div>
              </div>
            ) : (
              <div className="text-gray-400">Loading nutrition data...</div>
            )}
            {isUpdating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-lg transition-opacity duration-300">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Sleep Summary */}
          <div className="bg-black/60 border border-white/5 rounded-lg p-4 w-full relative">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Sleep</h3>
            </div>
            {sleepSummary ? (
              <div className={`space-y-3 transition-opacity duration-300 ${isUpdating ? 'opacity-50' : ''}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Average Duration</p>
                    <p className="text-lg font-semibold text-white">
                      {sleepSummary.stats.avgDuration.value} {sleepSummary.stats.avgDuration.unit}
                    </p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Average Rating</p>
                    <p className="text-lg font-semibold text-white">
                      {sleepSummary.stats.avgRating.value} / {sleepSummary.stats.avgRating.scale}
                    </p>
                  </div>
                </div>
                {sleepSummary.stats.consistency && (
                  <div className="bg-black/40 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Sleep Consistency</p>
                    <p className="text-lg font-semibold text-white">
                      {sleepSummary.stats.consistency.value} {sleepSummary.stats.consistency.unit}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">Loading sleep data...</div>
            )}
            {isUpdating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-lg transition-opacity duration-300">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 