'use client'

import { useState, useEffect } from 'react'
import { Client } from '@/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      } else {
        toast.error('Failed to fetch clients')
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Error loading clients')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminder = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/reminder`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Reminder sent successfully!')
      } else {
        toast.error('Failed to send reminder')
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast.error('Error sending reminder')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Client deleted successfully')
        setClients(clients.filter(client => client._id !== clientId))
      } else {
        toast.error('Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Error deleting client')
    }
  }

  const getClientStatus = (client: Client) => {
    const today = new Date()
    const daysUntilDue = Math.ceil((new Date(client.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) {
      return { label: 'Overdue', className: 'status-overdue' }
    } else if (daysUntilDue <= 7) {
      return { label: 'Due Soon', className: 'status-due' }
    } else {
      return { label: 'Active', className: 'status-active' }
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.mobile.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesService = filterService === '' || 
                          client.servicesTaken.some(service => service.toLowerCase().includes(filterService.toLowerCase()))
    
    const status = getClientStatus(client)
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'overdue' && status.label === 'Overdue') ||
                         (filterStatus === 'due' && status.label === 'Due Soon') ||
                         (filterStatus === 'active' && status.label === 'Active')
    
    return matchesSearch && matchesService && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients by name, mobile, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="select w-full sm:w-auto"
          >
            <option value="">All Services</option>
            <option value="haircut">Haircut</option>
            <option value="color">Hair Color</option>
            <option value="treatment">Hair Treatment</option>
            <option value="styling">Hair Styling</option>
            <option value="manicure">Manicure</option>
            <option value="pedicure">Pedicure</option>
          </select>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="due">Due Soon</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No clients found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Client Details</th>
                  <th>Contact</th>
                  <th>Services</th>
                  <th>Last Visit</th>
                  <th>Next Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const status = getClientStatus(client)
                  return (
                    <tr key={client._id}>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">
                            {client.appointmentHistory.length} appointments
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="text-gray-900">{client.mobile}</div>
                          <div className="text-gray-500">{client.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          {client.servicesTaken.slice(0, 2).join(', ')}
                          {client.servicesTaken.length > 2 && (
                            <span className="text-gray-500"> +{client.servicesTaken.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="text-sm text-gray-900">
                        {format(new Date(client.lastVisit), 'MMM d, yyyy')}
                      </td>
                      <td className="text-sm text-gray-900">
                        {format(new Date(client.nextDueDate), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <span className={status.className}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSendReminder(client._id)}
                            className="btn btn-outline text-xs"
                            title="Send Reminder"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client._id)}
                            className="btn btn-danger text-xs"
                            title="Delete Client"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}