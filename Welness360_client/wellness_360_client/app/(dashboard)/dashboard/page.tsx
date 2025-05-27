'use client'

import DashboardOverview from '@/components/dashboard/DashboardOverview'
import UserStats from '@/components/dashboard/UserStats'
export default function DashboardPage() {
  return (
    <div className="w-full max-w-none">
      <DashboardOverview />
      <UserStats />
    </div>
  )
} 