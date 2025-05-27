export interface UserProfile {
  name: string;
  height: number;
  weight: number;
  targetWeight: number;
  fitnessLevel: string;
  fitnessGoals: string[];
  activityLevel: string;
}

export interface UserStats {
  totalWorkouts: number;
  totalSleepLogs: number;
  totalFoodLogs: number;
  weeklyWorkouts: number;
  weeklySleepLogs: number;
  weeklyFoodLogs: number;
  completionRate: {
    workouts: number;
    sleepLogs: number;
    foodLogs: number;
  };
}

export interface ActivitySummary {
  period: string;
  periodLabel: string;
  stats: {
    workoutTime: {
      total: number;
      unit: string;
      change: number;
    };
    caloriesBurned: {
      total: number;
      unit: string;
      change: number;
    };
    activityCount: {
      total: number;
      change: number;
    };
  };
  topActivities: Array<{
    title: string;
    duration: number;
    calories: number;
    count: number;
  }>;
}

export interface NutritionSummary {
  period: string;
  periodLabel: string;
  stats: {
    calories: {
      total: number;
      average: number;
      unit: string;
      change: number;
    };
    protein: {
      total: number;
      average: number;
      unit: string;
      change: number;
      percentage: number;
    };
    carbs: {
      total: number;
      average: number;
      unit: string;
      change: number;
      percentage: number;
    };
    fats: {
      total: number;
      average: number;
      unit: string;
      change: number;
      percentage: number;
    };
  };
  macroDistribution: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface SleepSummary {
  period: string;
  periodLabel: string;
  stats: {
    avgDuration: {
      value: number;
      unit: string;
      change: number;
    };
    avgRating: {
      value: number;
      scale: string;
      change: number;
    };
    consistency: {
      value: number;
      unit: string;
    };
  };
  qualityDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    veryPoor: number;
  };
}

export interface ProgressTracking {
  weight: {
    current: number;
    target: number;
    difference: number;
    unit: string;
  };
  goal: {
    type: string;
    status: string;
    progressPercentage: number;
  };
  fitness: {
    level: string;
    activityLastMonth: number;
    consistencyScore: number;
  };
}

export interface DashboardOverview {
  profile: UserProfile;
  userStats: UserStats;
  activitySummary: ActivitySummary;
  nutritionSummary: NutritionSummary;
  sleepSummary: SleepSummary;
  progressTracking: ProgressTracking;
} 