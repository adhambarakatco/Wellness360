'use client'

import { useState, Dispatch, SetStateAction } from 'react'
import { Activity, Utensils, Moon, Plus } from 'lucide-react'
import WorkoutTracker from '@/components/dashboard/WorkoutTracker'
import NutritionTracker from '@/components/dashboard/NutritionTracker'
import SleepTracker from '@/components/dashboard/SleepTracker'

interface ActivityTabsProps {
  showAddEntry?: boolean;
  setShowAddEntry?: Dispatch<SetStateAction<boolean>>;
}

export default function ActivityTabs({ showAddEntry, setShowAddEntry }: ActivityTabsProps = {}) {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'sleep'>('workout')
  const [localShowAddEntry, setLocalShowAddEntry] = useState(false)

  // Use provided state or local state
  const formVisible = showAddEntry !== undefined ? showAddEntry : localShowAddEntry;
  const setFormVisible = setShowAddEntry || setLocalShowAddEntry;

  return (
    <div className="w-full mx-0">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto bg-black/30 p-1 rounded-xl mb-4 w-full no-scrollbar">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 px-2 sm:px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'workout'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Workout</span>
        </button>
        
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 px-2 sm:px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'nutrition'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Nutrition</span>
        </button>
        
        <button
          onClick={() => setActiveTab('sleep')}
          className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 px-2 sm:px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'sleep'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Sleep</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-4 md:p-6 w-full mx-0">
        {activeTab === 'workout' && (
          <div className="animate-in fade-in duration-300 w-full">
            <WorkoutTracker showForm={formVisible} setShowForm={setFormVisible} />
          </div>
        )}
        
        {activeTab === 'nutrition' && (
          <div className="animate-in fade-in duration-300 w-full">
            <NutritionTracker />
          </div>
        )}
        
        {activeTab === 'sleep' && (
          <div className="animate-in fade-in duration-300 w-full">
            <SleepTracker />
          </div>
        )}
      </div>
    </div>
  )
} 