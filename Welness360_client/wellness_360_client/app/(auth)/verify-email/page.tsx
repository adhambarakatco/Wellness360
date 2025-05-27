import VerifyEmailForm from '@/components/auth/VerifyEmailForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Email - Wellness 360',
  description: 'Verify your email address to complete your registration',
}

export default function VerifyEmailPage() {
  return <VerifyEmailForm />
} 