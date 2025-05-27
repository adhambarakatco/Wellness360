import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password - Wellness 360',
  description: 'Reset your Wellness 360 account password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}