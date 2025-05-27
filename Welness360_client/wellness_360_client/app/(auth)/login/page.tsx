import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Wellness 360',
  description: 'Sign in to your Wellness 360 account',
}

export default function LoginPage() {
  return <LoginForm />
} 