'use client'

import { useState, useEffect } from 'react'
import { Plus, Utensils, ChevronDown, Pencil, Trash2, AlertTriangle, X, Search, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FoodLog {
  _id: string
  userId: string
  title: string
  foodName: string
  calories: number
  protein: number
  carbs: number
  fats: number
  date: string
}

interface FoodItem {
  label: string
  foodId: string
  brand: string
  category: string
  measures: {
    label: string
    uri: string
  }[]
}

type ViewMode = 'today' | 'all' | 'date'

export default function NutritionTracker() {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<FoodLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [selectedMeasure, setSelectedMeasure] = useState<{ label: string; uri: string } | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [title, setTitle] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiMode, setAiMode] = useState(false)
  const [foodDescription, setFoodDescription] = useState('')
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState<string | null>(null)
  const [isMeasureDropdownOpen, setIsMeasureDropdownOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const fetchFoodLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/food-log', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your food logs')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch food logs')
      }

      const data = await response.json()
      setFoodLogs(data)
      
      // Set filtered logs based on current view mode
      filterLogs(data, viewMode, selectedDate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food logs')
      console.error('Error fetching food logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to filter logs based on date and view mode
  const filterLogs = (logs: FoodLog[], mode: ViewMode, date: Date) => {
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
      const logDate = new Date(log.date);
      return (
        logDate.getFullYear() === selectedYear &&
        logDate.getMonth() === selectedMonth &&
        logDate.getDate() === selectedDay
      );
    });
    
    setFilteredLogs(filtered);
  }

  useEffect(() => {
    fetchFoodLogs()
  }, [])

  useEffect(() => {
    // Update filtered logs when view mode or selected date changes
    filterLogs(foodLogs, viewMode, selectedDate)
  }, [viewMode, selectedDate, foodLogs])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setIsSearching(true)
      setError(null)
      const response = await fetch(`/api/food-log/search?query=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to search food items')
      }

      const data = await response.json()
      setSearchResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search food items')
      console.error('Error searching food items:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food)
    setSelectedMeasure(food.measures.length > 0 ? food.measures[0] : null)
    setTitle(food.label)
  }

  const handleMeasureSelect = (measure: { label: string; uri: string }) => {
    setSelectedMeasure(measure)
    setIsMeasureDropdownOpen(false)
  }

  const handleSubmitFoodLog = async () => {
    if (aiMode) {
      if (!foodDescription.trim()) {
        setError('Please enter a food description')
        return
      }

      try {
        setIsSubmitting(true)
        setError(null)
        
        const response = await fetch('/api/food-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            description: foodDescription,
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to log food')
        }

        await fetchFoodLogs()
        handleCancel()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to log food')
        console.error('Error logging food:', err)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      if (!selectedFood || !selectedMeasure) {
        setError('Please select a food item and measure')
        return
      }

      try {
        setIsSubmitting(true)
        setError(null)
        
        const response = await fetch('/api/food-log/log-by-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            foodId: selectedFood.foodId,
            measureURI: selectedMeasure.uri,
            quantity: quantity,
            title: title || selectedFood.label,
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to log food')
        }

        await fetchFoodLogs()
        handleCancel()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to log food')
        console.error('Error logging food:', err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleDeleteConfirm = (id: string) => {
    setLogToDelete(id)
    setIsDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!logToDelete) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      const response = await fetch(`/api/food-log/${logToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete food log')
      }

      await fetchFoodLogs()
      setIsDeleteConfirmOpen(false)
      setLogToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete food log')
      console.error('Error deleting food log:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsAddingEntry(false)
    setSearchQuery('')
    setSearchResults([])
    setSelectedFood(null)
    setSelectedMeasure(null)
    setQuantity(1)
    setTitle('')
    setFoodDescription('')
    setAiMode(false)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatSelectedDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate)
    prevDay.setDate(prevDay.getDate() - 1)
    setSelectedDate(prevDay)
    setViewMode('date')
  }

  // Navigate to next day
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    setSelectedDate(nextDay)
    setViewMode('date')
  }

  // Go to today
  const goToToday = () => {
    // Create a new date at the start of today in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day in local timezone
    setSelectedDate(today);
    setViewMode('today');
    
    // Re-filter logs with the newly set date
    filterLogs(foodLogs, 'today', today);
  }

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(new Date(date))
    setIsDatePickerOpen(false)
    setViewMode('date')
  }

  // Calculate total nutrition for the filtered logs
  const calculateTotalNutrition = () => {
    return filteredLogs.reduce(
      (totals, log) => {
        totals.calories += log.calories || 0
        totals.protein += log.protein || 0
        totals.carbs += log.carbs || 0
        totals.fats += log.fats || 0
        return totals
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  }

  const totals = calculateTotalNutrition()

  // Get unique dates from food logs for date picker
  const getUniqueDates = () => {
    const dates = foodLogs.map(log => new Date(log.date).toISOString().split('T')[0])
    return [...new Set(dates)].sort().reverse() // Sort by most recent first
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
      <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3 mb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsAddingEntry(prev => !prev)}
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
          {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Nutrition Summary Cards */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 w-full">
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3">
          <div className="text-primary text-xs font-medium mb-1">Calories</div>
          <div className="text-base font-semibold">{Math.round(totals.calories)}</div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3">
          <div className="text-blue-400 text-xs font-medium mb-1">Protein</div>
          <div className="text-base font-semibold">{Math.round(totals.protein)}g</div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3">
          <div className="text-green-400 text-xs font-medium mb-1">Carbs</div>
          <div className="text-base font-semibold">{Math.round(totals.carbs)}g</div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 sm:p-3">
          <div className="text-yellow-400 text-xs font-medium mb-1">Fats</div>
          <div className="text-base font-semibold">{Math.round(totals.fats)}g</div>
        </div>
      </div>

      {/* Food Log Form */}
      <AnimatePresence>
        {isAddingEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-black/50 border border-white/10 rounded-xl p-4 mb-4 w-full mx-0"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium">Log Food</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setAiMode(false)}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-sm ${
                  !aiMode ? 'bg-primary border-primary' : 'bg-transparent border-white/10 hover:bg-white/5'
                } transition-colors`}
              >
                Search Food
              </button>
              <button
                onClick={() => setAiMode(true)}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-sm ${
                  aiMode ? 'bg-primary border-primary' : 'bg-transparent border-white/10 hover:bg-white/5'
                } transition-colors`}
              >
                AI Assistant
              </button>
            </div>

            {aiMode ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="foodDescription" className="block text-xs font-medium text-gray-300 mb-1">
                    Food Description
                  </label>
                  <textarea
                    id="foodDescription"
                    value={foodDescription}
                    onChange={(e) => setFoodDescription(e.target.value)}
                    placeholder="Enter one food item (e.g., '1 apple' or 'a chicken breast')"
                    className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    rows={2}
                  />
                  <p className="mt-1 text-yellow-500 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Please enter only one food item at a time for accurate results
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="searchQuery" className="block text-xs font-medium text-gray-300 mb-1">
                    Search Food
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="searchQuery"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search food items..."
                      className="w-full p-2 sm:p-3 pl-8 sm:pl-10 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-2 sm:px-3 py-1 rounded text-xs disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="bg-black/30 rounded-lg border border-white/10 max-h-48 overflow-y-auto">
                    {searchResults.map((food) => (
                      <button
                        key={food.foodId}
                        onClick={() => handleFoodSelect(food)}
                        className={`w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors text-sm ${
                          selectedFood?.foodId === food.foodId ? 'bg-white/10' : ''
                        }`}
                      >
                        <div className="font-medium">{food.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {food.brand && `${food.brand} · `}{food.category}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedFood && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label htmlFor="title" className="block text-xs font-medium text-gray-300 mb-1">
                        Title/Label
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title for this food entry"
                        className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Measure
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => setIsMeasureDropdownOpen(!isMeasureDropdownOpen)}
                            className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white flex justify-between items-center text-sm"
                          >
                            <span>{selectedMeasure?.label || 'Select a measure'}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          
                          {isMeasureDropdownOpen && selectedFood.measures.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-black/95 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {selectedFood.measures.map((measure) => (
                                <button
                                  key={measure.uri}
                                  onClick={() => handleMeasureSelect(measure)}
                                  className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors text-sm"
                                >
                                  {measure.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="quantity" className="block text-xs font-medium text-gray-300 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          min="0.1"
                          step="0.1"
                          value={quantity}
                          onChange={(e) => {
                            // Allow clearing the field or setting a new value
                            const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                            setQuantity(value || 0);
                          }}
                          className="w-full p-2 sm:p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2 sm:gap-3">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFoodLog}
                disabled={
                  isSubmitting || 
                  (aiMode ? !foodDescription.trim() : !selectedFood || !selectedMeasure)
                }
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none text-sm"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Log List */}
      {isLoading ? (
        <div className="text-center py-8 w-full">
          <div className="animate-pulse text-sm">Loading food logs...</div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-xl p-8 text-center w-full">
          <Utensils className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="text-base font-medium mb-2">No food entries {viewMode !== 'all' ? 'for this day' : ''}</h3>
          <p className="text-gray-400 mb-4 max-w-md mx-auto text-sm">
            Start logging your meals to track your nutrition intake.
          </p>
          <button
            onClick={() => setIsAddingEntry(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Entry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 w-full">
          {filteredLogs.map((log) => (
            <div
              key={log._id}
              className="bg-black/30 border border-white/5 rounded-lg p-3 flex items-center justify-between gap-2"
            >
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{log.title}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(log.date)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-300">
                  <span>{Math.round(log.calories)} cal</span>
                  <span>{Math.round(log.protein)}g protein</span>
                  <span>{Math.round(log.carbs)}g carbs</span>
                  <span>{Math.round(log.fats)}g fats</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteConfirm(log._id)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/90 border border-white/10 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-base font-medium mb-2">Delete Food Log</h3>
              <p className="text-sm text-gray-300 mb-4 sm:mb-6">
                Are you sure you want to delete this food log? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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