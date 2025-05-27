'use client'

import { useState } from 'react'
import { 
  Clock, 
  Activity, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Target,
  Users,
  CheckCircle2,
  Dumbbell
} from 'lucide-react'
import { WorkoutDay } from '@/types/workout'
import { motion, AnimatePresence } from 'framer-motion'

interface WorkoutPlanCardProps {
  day: WorkoutDay
  index: number
  onComplete: (index: number) => void
  isLoading: boolean
}

export default function WorkoutPlanCard({ 
  day, 
  index, 
  onComplete,
  isLoading 
}: WorkoutPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(prev => !prev)
  }

  return (
    <div className={`bg-black/60 border border-white/5 rounded-lg overflow-hidden ${day.isCompleted ? 'border-green-500/30' : ''}`}>
      {/* Card Header */}
      <div 
        className={`p-3 flex items-center justify-between cursor-pointer ${day.isCompleted ? 'bg-green-900/20' : ''}`}
        onClick={toggleExpand}
      >
        <div className="flex items-center flex-1">
          <div className={`w-9 h-9 rounded-lg ${day.isCompleted ? 'bg-green-500' : 'bg-gray-700'} flex items-center justify-center mr-3`}>
            {day.isCompleted ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-white" />
            ) : (
              <Dumbbell className="w-4.5 h-4.5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-base">{day.day}</h3>
            <div className="text-xs text-gray-400">{day.focus}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{day.duration} min</span>
          </div>
          <div className="w-6 h-6 flex items-center justify-center">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/5"
          >
            <div className="p-4 space-y-5">
              {/* Warm-up Section */}
              <div>
                <h4 className="text-xs font-medium text-gray-400 mb-1.5">WARM UP</h4>
                <p className="text-xs">{day.warmup}</p>
              </div>

              {/* Exercises Section */}
              <div>
                <h4 className="text-xs font-medium text-gray-400 mb-2">EXERCISES</h4>
                <div className="space-y-3">
                  {day.exercises.map((exercise, idx) => (
                    <div key={idx} className="bg-black/40 rounded-lg p-3">
                      <h5 className="font-medium text-sm mb-1">{exercise.name}</h5>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-300 mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-400 mr-1.5">Sets:</span>
                          {exercise.sets}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-400 mr-1.5">Reps:</span>
                          {exercise.reps}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-400 mr-1.5">Rest:</span>
                          {exercise.restBetweenSets}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-400 mr-1.5">Equipment:</span>
                          {exercise.requiredEquipment.join(', ')}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h6 className="text-xs font-medium text-gray-400 mb-1">DESCRIPTION</h6>
                        <p className="text-xs">{exercise.description}</p>
                      </div>
                      {exercise.notes && (
                        <div className="mt-2">
                          <h6 className="text-xs font-medium text-gray-400 mb-1">NOTES</h6>
                          <p className="text-xs">{exercise.notes}</p>
                        </div>
                      )}
                      <div className="mt-2">
                        <h6 className="text-xs font-medium text-gray-400 mb-1">TARGET MUSCLES</h6>
                        <div className="flex flex-wrap gap-1.5">
                          {exercise.targetMuscles.map((muscle, midx) => (
                            <span 
                              key={midx} 
                              className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cool-down Section */}
              <div>
                <h4 className="text-xs font-medium text-gray-400 mb-1.5">COOL DOWN</h4>
                <p className="text-xs">{day.cooldown}</p>
              </div>

              {/* Notes Section */}
              {day.notes && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-1.5">ADDITIONAL NOTES</h4>
                  <p className="text-xs">{day.notes}</p>
                </div>
              )}

              {/* Complete Button */}
              {!day.isCompleted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onComplete(index)
                  }}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition mt-3"
                >
                  {isLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      <span className="text-sm">Mark as Completed</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 