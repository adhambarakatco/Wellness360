import SignUpForm from '@/components/auth/SignUpForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - Wellness 360',
  description: 'Create your account to start your wellness journey',
}

export default function SignUpPage() {
  return <SignUpForm />
} 