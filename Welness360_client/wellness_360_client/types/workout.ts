export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum FitnessGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness',
}

export enum WorkoutType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  HIIT = 'hiit',
  CIRCUIT = 'circuit',
  CUSTOM = 'custom',
}

export enum WorkoutDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface WorkoutProfile {
  _id: string;
  userId: string;
  fitnessLevel: FitnessLevel | string;
  fitnessGoals: FitnessGoal[] | string[];
  preferredActivities: string[];
  height: number;
  weight: number;
  targetWeight: number;
  hasInjuries: boolean;
  injuries: string[];
  availableWorkoutDays: number;
  preferredWorkoutDuration: number;
  hasGymAccess: boolean;
  availableEquipment: string[];
  age: number;
  gender: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutDay {
  _id: string;
  day: string;
  focus: string;
  warmup: string;
  exercises: WorkoutExercise[];
  cooldown: string;
  duration: number;
  notes: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface WorkoutExercise {
  _id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  restBetweenSets: string;
  targetMuscles: string[];
  requiredEquipment: string[];
  notes: string;
  imageUrl: string;
  videoUrl: string;
}

export interface WorkoutPlan {
  _id: string;
  name: string;
  description: string;
  userId: string;
  type: WorkoutType | string;
  difficulty: WorkoutDifficulty | string;
  goals: FitnessGoal[] | string[];
  targetAreas: string[];
  workoutDays: WorkoutDay[];
} 