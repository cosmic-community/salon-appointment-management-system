import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import ToastProvider from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Salon Management System',
  description: 'Complete salon appointment management with automated reminders and client tracking',
  keywords: 'salon, appointment, management, beauty, scheduling, reminders',
  authors: [{ name: 'Salon Management System' }],
  viewport: 'width=device-width, initial-scale=1',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Console capture script for dashboard debugging */}
        <script src="/dashboard-console-capture.js" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <SessionProvider>
          <ToastProvider>
            <div className="min-h-full">
              {children}
            </div>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}