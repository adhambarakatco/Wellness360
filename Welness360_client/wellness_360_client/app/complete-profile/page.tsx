import CompleteProfileForm from '@/components/auth/CompleteProfileForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Complete Profile - Wellness 360',
  description: 'Complete your profile to continue using Wellness 360',
}

export default function CompleteProfilePage() {
  return <CompleteProfileForm />
}