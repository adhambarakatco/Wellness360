import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Template from '@/components/layout/Template'
import { AuthProvider } from '@/contexts/auth'
import { NotificationProvider } from '@/contexts/notifications'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wellness 360',
  description: 'Your complete wellness companion',
  icons: {
    icon: '/icons/moon.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <Template>{children}</Template>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}