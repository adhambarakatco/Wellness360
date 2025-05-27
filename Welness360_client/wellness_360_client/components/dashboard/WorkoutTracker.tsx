'use client'

import { useState, Dispatch, SetStateAction, useEffect, useRef } from 'react'
import { 
  ChevronDown, 
  Activity, 
  Loader2,
  Wind,
  Bike,
  Dumbbell,
  Droplet,
  Globe,
  CircleDashed,
  Heart,
  Flower2,
  Footprints,
  Mountain,
  Waves,
  Snowflake,
  Sword,
  Music,
  Ship,
  Flag,
  Flame,
  Trophy,
  HandIcon,
  Table2,
  Trash2,
  X,
  AlertTriangle,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  Info,
  RefreshCw,
  Pencil
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Activity {
  id: string;
  name: string;
  met: number;
}

interface ActivityLog {
  _id: string;
  activity: string;
  duration: number;
  title: string;
  caloriesBurned: number;
  date: string;
}

interface WorkoutTrackerProps {
  showForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  period?: 'daily' | 'weekly' | 'monthly';
}

type ViewMode = 'today' | 'all' | 'date'

export default function WorkoutTracker({ showForm, setShowForm, period = 'daily' }: WorkoutTrackerProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [userActivityLogs, setUserActivityLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    activityId: '',
    title: '',
    duration: ''
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{visible: boolean, activityId: string, title: string}>({
    visible: false,
    activityId: '',
    title: ''
  })
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<ActivityLog | null>(null)

  // Add useEffect to fetch activities and user logs on mount
  useEffect(() => {
    fetchActivities()
    fetchUserActivityLogs()
  }, [])

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Function to filter logs based on date and view mode
  const filterLogs = (logs: ActivityLog[], mode: ViewMode, date: Date) => {
    if (mode === 'all') {
      setFilteredLogs(logs)
      return
    }

    // Use local date components to avoid timezone issues
    const selectedYear = date.getFullYear();
    const selectedMonth = date.getMonth();
    const selectedDay = date.getDate();
    
    // Filter logs for the selected date using local date comparison
    const filtered = logs.filter(log => {
      try {
        // Check if date exists and is valid
        if (!log.date) {
          console.warn('Log missing date:', log)
          return false
        }

        const logDate = new Date(log.date)
        if (isNaN(logDate.getTime())) {
          console.warn('Invalid date in log:', log)
          return false
        }

        // Compare year, month, and day components
        return (
          logDate.getFullYear() === selectedYear &&
          logDate.getMonth() === selectedMonth &&
          logDate.getDate() === selectedDay
        );
      } catch (error) {
        console.error('Error processing log date:', error, log)
        return false
      }
    })
    
    setFilteredLogs(filtered)
  }

  // Update filtered logs when view mode or selected date changes
  useEffect(() => {
    filterLogs(userActivityLogs, viewMode, selectedDate)
  }, [viewMode, selectedDate, userActivityLogs])

  const fetchActivities = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/activity?type=activities')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`)
      }
      
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      
      setError('Could not load activities. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserActivityLogs = async () => {
    setIsLoadingLogs(true)
    
    try {
      const response = await fetch('/api/activity')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user logs: ${response.status}`)
      }
      
      const data = await response.json()
      
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array of logs but got:', typeof data)
        setUserActivityLogs([])
        return
      }

      // Validate each log has required fields
      const validLogs = data.filter(log => {
        const isValid = log && typeof log === 'object' && 
                       'date' in log && 
                       'activity' in log && 
                       'duration' in log
        if (!isValid) {
          console.warn('Invalid log entry:', log)
        }
        return isValid
      })

      
      setUserActivityLogs(validLogs)
      // Filter logs based on current view mode
      filterLogs(validLogs, viewMode, selectedDate)
    } catch (error) {
      console.error('Error fetching logs:', error)
      setError('Could not load activities. Please try again.')
      setUserActivityLogs([])
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {      
      // Format the selected date to include time
      const selectedDateTime = new Date(selectedDate)
      selectedDateTime.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues
      
      const url = editingLog 
        ? `/api/activity?id=${editingLog._id}`
        : '/api/activity';
      
      const requestData = {
        activityId: formData.activityId,
        duration: Number(formData.duration),
        title: formData.title,
        date: selectedDateTime.toISOString()
      };
      
      
      const response = await fetch(url, {
        method: editingLog ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to ${editingLog ? 'update' : 'save'} activity: ${errorText}`)
      }
      
      // Reset form and close
      setFormData({
        activityId: '',
        title: '',
        duration: ''
      })
      
      setShowForm(false)
      setEditingLog(null)
      
      // Refresh user activity logs after successful submission
      await fetchUserActivityLogs()
      
    } catch (error) {
      console.error('Error submitting activity:', error)
      setError(error instanceof Error ? error.message : 'Failed to save activity. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (log: ActivityLog) => {    // Find the matching activity by name
    const matchingActivity = activities.find(a => a.name === log.activity);
    
    setEditingLog(log)
    // Parse the date from the log
    const logDate = new Date(log.date)
    setSelectedDate(logDate)
    setFormData({
      activityId: matchingActivity?.id || log.activity, // Use the activity ID if found, fallback to the name
      title: log.title,
      duration: log.duration.toString()
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingLog(null)
    setFormData({
      activityId: '',
      title: '',
      duration: ''
    })
    setShowForm(false)
  }

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString)
        return 'Invalid date'
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return 'Invalid date'
    }
  }

  // Custom dropdown handlers
  const handleDropdownClick = () => {
    if (!isLoading && !isSubmitting) {
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  const selectActivity = (id: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      activityId: id
    }))
    setIsDropdownOpen(false)
  }

  const deleteActivity = async (id: string) => {
    setIsDeleting(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/activity?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete activity: ${response.status}`)
      }
      
      // Refresh logs after deletion
      fetchUserActivityLogs()
      
    } catch (error) {
      setError('Failed to delete activity. Please try again.')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmation({ visible: false, activityId: '', title: '' })
    }
  }
  
  const confirmDelete = (activityId: string, title: string) => {
    setDeleteConfirmation({
      visible: true,
      activityId,
      title
    })
  }
  
  const cancelDelete = () => {
    setDeleteConfirmation({
      visible: false,
      activityId: '',
      title: ''
    })
  }

  // Date navigation functions
  const formatSelectedDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate)
    prevDay.setDate(prevDay.getDate() - 1)
    setSelectedDate(prevDay)
    setViewMode('date')
  }

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    setSelectedDate(nextDay)
    setViewMode('date')
  }

  const goToToday = () => {
    // Create a new date at the start of today in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day in local timezone
    setSelectedDate(today);
    setViewMode('today');
    
    // Re-filter logs with the newly set date
    filterLogs(userActivityLogs, 'today', today);
  }

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(new Date(dateStr))
    setIsDatePickerOpen(false)
    setViewMode('date')
  }

  // Get unique dates from all activity logs
  const getUniqueDates = () => {
    const dates = userActivityLogs
      .map(log => {
        try {
          if (!log.date) return null
          const date = new Date(log.date)
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
        } catch (error) {
          console.error('Error processing date:', error, log)
          return null
        }
      })
      .filter((date): date is string => date !== null)
    
    return [...new Set(dates)].sort().reverse() // Sort by most recent first
  }

  // Calculate workout stats for the filtered logs
  const calculateWorkoutStats = () => {
    if (filteredLogs.length === 0) {
      return { totalCalories: 0, totalMinutes: 0, workouts: 0 }
    }
    
    const totalCalories = filteredLogs.reduce((sum, log) => sum + log.caloriesBurned, 0)
    const totalMinutes = filteredLogs.reduce((sum, log) => sum + log.duration, 0)
    
    return {
      totalCalories,
      totalMinutes,
      workouts: filteredLogs.length
    }
  }

  const workoutStats = calculateWorkoutStats()

  const getActivityIcon = (activityName: string) => {
    const activityNameLower = activityName.toLowerCase()
    
    if (activityNameLower.includes('run') || activityNameLower.includes('jog')) {
      return <Footprints className="w-5 h-5" />
    } else if (activityNameLower.includes('swim')) {
      return <Waves className="w-5 h-5" />
    } else if (activityNameLower.includes('walk')) {
      return <Footprints className="w-5 h-5" />
    } else if (activityNameLower.includes('bike') || activityNameLower.includes('cycle')) {
      return <Bike className="w-5 h-5" />
    } else if (activityNameLower.includes('weight') || activityNameLower.includes('strength')) {
      return <Dumbbell className="w-5 h-5" />
    } else if (activityNameLower.includes('yoga')) {
      return <Flower2 className="w-5 h-5" />
    } else if (activityNameLower.includes('hike') || activityNameLower.includes('climb')) {
      return <Mountain className="w-5 h-5" />
    } else if (activityNameLower.includes('ski') || activityNameLower.includes('snow')) {
      return <Snowflake className="w-5 h-5" />
    } else if (activityNameLower.includes('martial') || activityNameLower.includes('box')) {
      return <Sword className="w-5 h-5" />
    } else if (activityNameLower.includes('dance')) {
      return <Music className="w-5 h-5" />
    } else if (activityNameLower.includes('sail') || activityNameLower.includes('boat')) {
      return <Ship className="w-5 h-5" />
    } else if (activityNameLower.includes('golf')) {
      return <Flag className="w-5 h-5" />
    } else if (activityNameLower.includes('tennis') || activityNameLower.includes('badminton')) {
      return <Activity className="w-5 h-5" />
    } else if (activityNameLower.includes('football') || activityNameLower.includes('soccer')) {
      return <Globe className="w-5 h-5" />
    } else if (activityNameLower.includes('basketball')) {
      return <CircleDashed className="w-5 h-5" />
    } else if (activityNameLower.includes('volleyball')) {
      return <HandIcon className="w-5 h-5" />
    } else if (activityNameLower.includes('baseball')) {
      return <Activity className="w-5 h-5" />
    } else if (activityNameLower.includes('table') || activityNameLower.includes('ping')) {
      return <Table2 className="w-5 h-5" />
    } else {
      return <Activity className="w-5 h-5" />
    }
  }

  const getSelectedActivityName = () => {
    const selectedActivity = activities.find(a => a.id === formData.activityId)
    return selectedActivity ? selectedActivity.name : formData.activityId // Fallback to the ID if no matching activity found
  }

  // Use effect to generate a random workout when form is shown
  useEffect(() => {
    if (showForm && activities.length > 0 && !editingLog) {
      generateRandomWorkout()
    }
  }, [showForm, activities.length, editingLog])

  // Generate a random workout
  const generateRandomWorkout = () => {
    if (activities.length === 0 || editingLog) {
      return
    }
    
    // Select a random activity
    const randomActivity = activities[Math.floor(Math.random() * activities.length)]
    
    // Generate a random duration between 15-60 minutes
    const duration = Math.floor(Math.random() * 45) + 15
    
    // Generate a title
    const titles = [
      `${randomActivity.name} Workout`,
      `Quick ${randomActivity.name}`,
      `${randomActivity.name} Session`,
      `Daily ${randomActivity.name}`
    ]
    const title = titles[Math.floor(Math.random() * titles.length)]
    
    // Set the form data
    setFormData({
      activityId: randomActivity.id,
      title: title,
      duration: duration.toString()
    })
  }

  return (
    <div className="w-full mx-0">
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary p-1.5 sm:p-2 rounded-lg transition-colors"
            aria-label={showForm ? 'Hide form' : 'Show form'}
            disabled={showForm}
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button 
            onClick={goToPreviousDay}
            className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 hover:bg-white/10 rounded-lg transition-colors text-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {viewMode === 'all' 
                  ? 'All Time' 
                  : viewMode === 'today' 
                    ? 'Today' 
                    : formatSelectedDate(selectedDate)}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/10 rounded-lg shadow-lg w-56 z-10">
                <div className="p-2 border-b border-white/10">
                  <button 
                    onClick={goToToday}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => {
                      setViewMode('all')
                      setIsDatePickerOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    All Logs
                  </button>
                </div>
                  
                {getUniqueDates().length > 0 && (
                  <div className="max-h-48 overflow-y-auto p-2">
                    <div className="text-xs text-gray-400 px-3 py-1">Select Date</div>
                    {getUniqueDates().map(date => (
                      <button 
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm"
                      >
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={goToNextDay}
            className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-xs sm:text-sm text-gray-400">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>
                  
      {/* Workout Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 w-full">
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-4">
          <div className="text-primary text-xs font-medium mb-1">Total Calories</div>
          <div className="text-base font-semibold">{Math.round(workoutStats.totalCalories)} cal</div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-4">
          <div className="text-primary text-xs font-medium mb-1">Activity Time</div>
          <div className="text-base font-semibold">{Math.round(workoutStats.totalMinutes)} min</div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-4">
          <div className="text-primary text-xs font-medium mb-1">Workouts</div>
          <div className="text-base font-semibold">{workoutStats.workouts}</div>
        </div>
      </div>

      {/* Workout Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-black/50 border border-white/10 rounded-xl p-4 mb-4 w-full mx-0"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium">{editingLog ? 'Edit Workout' : 'Log Workout'}</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 w-full">
              <div className="relative" ref={dropdownRef}>
                <label htmlFor="activity" className="block text-xs font-medium text-gray-300 mb-1">
                  Activity
                </label>
                <button
                  type="button"
                  onClick={handleDropdownClick}
                  disabled={isLoading || isSubmitting}
                  className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-2">
                    {formData.activityId && (
                      <span className="text-primary">
                        {getActivityIcon(getSelectedActivityName())}
                      </span>
                    )}
                    <span>{getSelectedActivityName()}</span>
                  </div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-black/95 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {activities.map(activity => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => selectActivity(activity.id, activity.name)}
                        className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-primary">{getActivityIcon(activity.name)}</span>
                          <span>{activity.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="title" className="block text-xs font-medium text-gray-300 mb-1">
                  Title/Note
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Workout title"
                  className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="duration" className="block text-xs font-medium text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-xs font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={selectedDate instanceof Date && !isNaN(selectedDate.getTime()) 
                      ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
                          .toISOString()
                          .split('T')[0]
                      : new Date().toISOString().split('T')[0]
                    }
                    onChange={(e) => {
                      // Create date at noon to avoid timezone issues
                      const date = new Date(e.target.value);
                      date.setHours(12, 0, 0, 0);
                      setSelectedDate(date);
                    }}
                    className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200">
                <p className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>{editingLog ? 'Edit your workout details below.' : 'A sample workout has been generated for you. You can adjust it as needed.'}</span>
                </p>
              </div>

              <div className="mt-4 flex justify-between sm:justify-end gap-2 sm:gap-3">
                {!editingLog && (
                  <button
                    type="button"
                    onClick={generateRandomWorkout}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.activityId || !formData.duration}
                    className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none text-sm"
                  >
                    {isSubmitting ? 'Saving...' : editingLog ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Logs List */}
      {isLoadingLogs ? (
        <div className="text-center py-6 w-full">
          <div className="animate-pulse text-sm">Loading workout logs...</div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-lg p-6 text-center w-full">
          <Activity className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="text-base font-medium mb-2">No workout logs {viewMode !== 'all' ? 'for this day' : ''}</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-4 text-sm">
            Start tracking your workouts to monitor your fitness progress.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Workout</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 w-full">
          {filteredLogs.map((log) => (
            <div
              key={log._id}
              className="bg-black/30 border border-white/5 rounded-lg p-3 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 text-primary rounded-lg">
                  {getActivityIcon(log.activity)}
                </div>
                <div>
                  <div className="font-medium text-sm">{log.title || log.activity}</div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{formatDate(log.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{log.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-gray-400" />
                      <span>{Math.round(log.caloriesBurned)} cal</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(log)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(log._id, log.title || log.activity)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
      {deleteConfirmation.visible && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-medium mb-2">Delete Workout</h3>
              <p className="text-gray-300 mb-6 text-sm">
                Are you sure you want to delete "{deleteConfirmation.title}"? This action cannot be undone.
              </p>
            
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteActivity(deleteConfirmation.activityId)}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 