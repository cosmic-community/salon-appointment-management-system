'use client'

import { useState, useEffect } from 'react'
import { Client } from '@/types'
import { format } from 'date-fns'

export default function UpcomingAppointments() {
  const [upcomingClients, setUpcomingClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingAppointments()
  }, [])

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch('/api/clients?filter=due&limit=5')
      if (response.ok) {
        const data = await response.json()
        setUpcomingClients(data)
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Appointments
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Upcoming Appointments
        </h3>
        <span className="text-sm text-gray-500">Next 30 days</span>
      </div>

      {upcomingClients.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">No upcoming appointments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingClients.map((client) => {
            const daysText = getDaysUntilDue(client.nextDueDate.toString())
            const isOverdue = daysText.includes('overdue')
            const isDueToday = daysText.includes('today')
            
            return (
              <div
                key={client._id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  isOverdue 
                    ? 'border-red-200 bg-red-50' 
                    : isDueToday 
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  isOverdue 
                    ? 'bg-red-500' 
                    : isDueToday 
                      ? 'bg-yellow-500'
                      : 'bg-primary-500'
                }`}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {client.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{client.mobile}</span>
                    <span>•</span>
                    <span>{client.servicesTaken[0]}</span>
                  </div>
                  <p className={`text-xs font-medium mt-1 ${
                    isOverdue 
                      ? 'text-red-600' 
                      : isDueToday 
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                  }`}>
                    {daysText}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="btn btn-outline text-xs p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full btn btn-outline text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          View Full Calendar
        </button>
      </div>
    </div>
  )
}