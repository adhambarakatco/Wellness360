'use client'

import { useState, useEffect } from 'react'
import { Plus, Moon, ChevronDown, Pencil, Trash2, AlertTriangle, X, Clock, Calendar, Star, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SleepEntry {
  _id: string
  userID: string
  startTime: string
  endTime: string
  duration: number
  rating: number
  notes: string
  createdAt: string
  updatedAt: string
  __v: number
}

const SLEEP_QUALITY_OPTIONS = [
  { label: 'Excellent', value: 5, description: 'Woke up feeling fully refreshed' },
  { label: 'Great', value: 4, description: 'Slept well with minor interruptions' },
  { label: 'Good', value: 3, description: 'Decent sleep, but could be better' },
  { label: 'Fair', value: 2, description: 'Had trouble sleeping' },
  { label: 'Poor', value: 1, description: 'Barely slept or very restless' }
]

type ViewMode = 'today' | 'all' | 'date'

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${positionClasses[position]} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50`}>
        <div className="flex items-center">
          <div className="bg-[#0A0A0A] text-white text-sm py-2 px-3 rounded-lg shadow-lg border border-white/10 whitespace-nowrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SleepTracker() {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<SleepEntry[]>([])
  const [isQualityOpen, setIsQualityOpen] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<{ label: string; value: number } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<SleepEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const fetchSleepEntries = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/sleep', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your sleep records')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch sleep records')
      }

      const data = await response.json()
      setSleepEntries(data)
      
      // Filter entries based on current view mode
      filterEntries(data, viewMode, selectedDate)
      
      setEditingEntry(null)
      setIsAddingEntry(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sleep records')
      console.error('Error fetching sleep records:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to filter entries based on date and view mode
  const filterEntries = (entries: SleepEntry[], mode: ViewMode, date: Date) => {
    if (mode === 'all') {
      setFilteredEntries(entries)
      return
    }

    // Fix: Use local date formatting to avoid timezone issues
    const selectedYear = date.getFullYear();
    const selectedMonth = date.getMonth();
    const selectedDay = date.getDate();
    
    // Filter entries for the selected date accounting for timezone differences
    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getFullYear() === selectedYear &&
        entryDate.getMonth() === selectedMonth &&
        entryDate.getDate() === selectedDay
      );
    });
    
    setFilteredEntries(filtered);
  }

  useEffect(() => {
    fetchSleepEntries()
  }, [])

  useEffect(() => {
    // Update filtered entries when view mode or selected date changes
    filterEntries(sleepEntries, viewMode, selectedDate)
  }, [viewMode, selectedDate, sleepEntries])

  useEffect(() => {
    if (isAddingEntry) {
      if (!editingEntry) {
        const dateInputValue = selectedDate.toISOString().split('T')[0]
        setSelectedTime('')
        setSelectedQuality(null)
      } else {
        const date = new Date(editingEntry.startTime)
        setSelectedDate(date)
        setSelectedTime(date.toTimeString().split(':').slice(0, 2).join(':'))
        const quality = SLEEP_QUALITY_OPTIONS.find(q => q.value === editingEntry.rating)
        setSelectedQuality(quality || null)
      }
    }
  }, [isAddingEntry, editingEntry])

  const handleQualitySelect = (option: { label: string; value: number }) => {
    setSelectedQuality(option)
    setIsQualityOpen(false)
  }

  const calculateEndTime = (date: string, time: string, durationHours: number): string => {
    const startDateTime = new Date(`${date}T${time}`)
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000)
    return endDateTime.toISOString()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      
      const formData = new FormData(event.currentTarget)
      const date = formData.get('date') as string
      const time = formData.get('time') as string
      const duration = parseFloat(formData.get('duration') as string)
      
      // Create a date object with the specified local date and time
      // Set to local timezone by creating a date string without timezone information
      const localDateTimeStr = `${date}T${time}:00`
      const startDateTime = new Date(localDateTimeStr)
      
      // Ensure the date is valid
      if (isNaN(startDateTime.getTime())) {
        throw new Error('Invalid date or time provided')
      }
      
      // Calculate end time
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000)
      
      const sleepData = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration,
        rating: selectedQuality?.value || 5,
        notes: formData.get('notes') as string || ''
      }

      let response;
      if (editingEntry) {
        // Update existing entry using the [id] route
        response = await fetch(`/api/sleep/${editingEntry._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(sleepData),
        });
      } else {
        // Create new entry
        response = await fetch('/api/sleep', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(sleepData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${editingEntry ? 'update' : 'create'} sleep record`)
      }

      await fetchSleepEntries()
      handleCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingEntry ? 'update' : 'create'} sleep record`)
      console.error('Error saving sleep record:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (entry: SleepEntry) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Use the [id] route for deletion
      const response = await fetch(`/api/sleep/${entry._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete sleep record')
      }

      setDeletingEntry(null)
      await fetchSleepEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sleep record')
      console.error('Error deleting sleep record:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} at ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`
  }

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    return Math.round((end - start) / (1000 * 60 * 60) * 10) / 10 // Round to 1 decimal place
  }

  const handleEdit = (entry: SleepEntry) => {
    setEditingEntry(entry)
    setIsAddingEntry(true)
  }

  const handleCancel = () => {
    setIsAddingEntry(false)
    setEditingEntry(null)
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
    
    // Re-filter entries with the newly set date
    filterEntries(sleepEntries, 'today', today);
  }

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(new Date(dateStr))
    setIsDatePickerOpen(false)
    setViewMode('date')
  }

  // Get unique dates from all sleep entries
  const getUniqueDates = () => {
    const dates = sleepEntries.map(entry => new Date(entry.startTime).toISOString().split('T')[0])
    return [...new Set(dates)].sort().reverse() // Sort by most recent first
  }

  // Calculate average sleep metrics for the filtered entries
  const calculateSleepStats = () => {
    if (filteredEntries.length === 0) {
      return { totalDuration: 0, avgDuration: 0, avgRating: 0 }
    }
    
    const totalDuration = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const totalRating = filteredEntries.reduce((sum, entry) => sum + entry.rating, 0)
    
    return {
      totalDuration,
      avgDuration: totalDuration / filteredEntries.length,
      avgRating: totalRating / filteredEntries.length
    }
  }

  const sleepStats = calculateSleepStats()

  return (
    <div className="w-full mx-0">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-100 text-sm">{error}</p>
        </div>
      )}
      
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3 mb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              setIsAddingEntry(prev => !prev);
              if (!isAddingEntry) setEditingEntry(null);
            }}
            className="bg-primary p-1.5 sm:p-2 rounded-lg transition-colors"
            aria-label={isAddingEntry ? 'Hide form' : 'Show form'}
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
              onClick={() => setIsDatePickerOpen(prev => !prev)}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 hover:bg-white/10 rounded-lg transition-colors text-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {viewMode === 'all' 
                  ? 'All Logs' 
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
          {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>
      
      {/* Sleep Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 w-full">
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3">
          <div className="text-indigo-400 text-xs font-medium mb-1">Avg. Duration</div>
          <div className="text-base font-semibold">{sleepStats.avgDuration.toFixed(1)} hrs</div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3">
          <div className="text-purple-400 text-xs font-medium mb-1">Avg. Quality</div>
          <div className="text-base font-semibold flex items-center">
            {sleepStats.avgRating.toFixed(1)}
            <Star className="w-4 h-4 text-yellow-500 ml-1" />
          </div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3">
          <div className="text-blue-400 text-xs font-medium mb-1">Total Sleep</div>
          <div className="text-base font-semibold">{sleepStats.totalDuration.toFixed(1)} hrs</div>
        </div>
      </div>
      
      {/* Sleep Entry Form */}
      <AnimatePresence>
        {isAddingEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-black/50 border border-white/10 rounded-xl p-4 mb-4 w-full mx-0"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium">{editingEntry ? 'Edit Sleep Entry' : 'Add Sleep Entry'}</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="date" className="block text-xs font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    defaultValue={selectedDate instanceof Date && !isNaN(selectedDate.getTime()) 
                      ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
                          .toISOString()
                          .split('T')[0]
                      : new Date().toISOString().split('T')[0]
                    }
                    className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-xs font-medium text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    defaultValue={selectedTime}
                    className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="duration" className="block text-xs font-medium text-gray-300 mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="0.1"
                    step="0.1"
                    defaultValue={editingEntry?.duration || "8"}
                    className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Sleep Quality
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsQualityOpen(!isQualityOpen)}
                      className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white flex justify-between items-center text-sm"
                    >
                      <span>{selectedQuality ? selectedQuality.label : 'Select quality'}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    
                    {isQualityOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-black/95 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {SLEEP_QUALITY_OPTIONS.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => handleQualitySelect(option)}
                            className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 transition-colors text-sm"
                          >
                            <div className="flex justify-between items-center">
                              <span>{option.label}</span>
                              <div className="flex">
                                {[...Array(option.value)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-medium text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  defaultValue={editingEntry?.notes || ""}
                  className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="How did you sleep? Any observations about your sleep quality?"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none text-sm"
                >
                  {isSubmitting 
                    ? (editingEntry ? 'Updating...' : 'Saving...') 
                    : (editingEntry ? 'Update' : 'Save')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sleep Entries */}
      {isLoading ? (
        <div className="text-center py-8 w-full">
          <div className="animate-pulse text-sm">Loading sleep records...</div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-xl p-8 text-center w-full">
          <Moon className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="text-base font-medium mb-2">No sleep entries {viewMode !== 'all' ? 'for this day' : ''}</h3>
          <p className="text-gray-400 mb-4 max-w-md mx-auto text-sm">
            Track your sleep to improve your rest quality and overall well-being.
          </p>
          <button
            onClick={() => {
              setIsAddingEntry(true);
              setEditingEntry(null);
            }}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sleep Entry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 w-full">
          {filteredEntries.map((entry) => (
            <div
              key={entry._id}
              className="bg-black/30 border border-white/5 rounded-lg p-3"
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{entry.duration} hours</div>
                    <div className="flex">
                      {[...Array(entry.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 sm:gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateTime(entry.startTime)}</span>
                  </div>
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <Tooltip content="Edit">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <button
                      onClick={() => setDeletingEntry(entry)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
              {entry.notes && (
                <div className="mt-2 text-xs text-gray-300 bg-white/5 p-2 sm:p-3 rounded-lg">
                  {entry.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingEntry && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/90 border border-white/10 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-base font-medium mb-2">Delete Sleep Entry</h3>
              <p className="text-sm text-gray-300 mb-4 sm:mb-6">
                Are you sure you want to delete this sleep entry? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setDeletingEntry(null)}
                  className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingEntry)}
                  disabled={isSubmitting}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 