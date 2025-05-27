export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'lightly active' | 'moderately active' | 'very active' | 'extremely active';
  goal: 'maintain' | 'lose' | 'gain';
  dailyCalories: number;
  caloriesLeft: number;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
} 