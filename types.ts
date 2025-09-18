import { Document } from 'mongoose'

// NextAuth types extension
declare module 'next-auth' {
  interface User {
    id: string
    username: string
    role: string
  }

  interface Session {
    user: {
      id: string
      username: string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    username: string
  }
}

// Base interfaces for Cosmic CMS integration
interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Client Management Types
export interface Client extends Document {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  servicesTaken: string[];
  lastVisit: Date;
  nextDueDate: Date;
  appointmentHistory: AppointmentHistory[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentHistory {
  _id: string;
  date: Date;
  service: string;
  price?: number;
  notes?: string;
  status: AppointmentStatus;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

// Notification Types
export interface NotificationSettings {
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
  reminderDays: number; // Days before due date to send reminder
}

export interface NotificationTemplate {
  type: 'sms' | 'email' | 'whatsapp';
  subject?: string; // For email
  message: string;
}

// Search and Filter Types
export interface ClientSearchFilters {
  search?: string;
  service?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: 'due' | 'overdue' | 'recent' | 'all';
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalClients: number;
  upcomingAppointments: number;
  overdueClients: number;
  monthlyRevenue: number;
  popularServices: Array<{
    service: string;
    count: number;
  }>;
}

// Calendar Types
export interface CalendarAppointment {
  id: string;
  clientName: string;
  clientId: string;
  service: string;
  date: Date;
  duration?: number; // in minutes
  status: AppointmentStatus;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Data Types
export interface ClientFormData {
  name: string;
  mobile: string;
  email: string;
  servicesTaken: string[];
  lastVisit: string; // ISO string
  notes?: string;
}

export interface AppointmentFormData {
  clientId: string;
  service: string;
  date: string; // ISO string
  duration?: number;
  notes?: string;
}

// Export Types
export type ExportFormat = 'csv' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  fields: string[];
  filters?: ClientSearchFilters;
}

// Cosmic CMS Types
export interface SalonService extends CosmicObject {
  type: 'services';
  metadata: {
    price?: number;
    duration?: number; // in minutes
    description?: string;
    category?: string;
    active?: boolean;
  };
}

export interface BusinessSettings extends CosmicObject {
  type: 'settings';
  metadata: {
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
    workingHours?: {
      [key: string]: {
        open: string;
        close: string;
        isOpen: boolean;
      };
    };
    appointmentDuration?: number; // default duration in minutes
    reminderSettings?: NotificationSettings;
  };
}

export interface StaffMember extends CosmicObject {
  type: 'staff';
  metadata: {
    position?: string;
    phone?: string;
    email?: string;
    specialties?: string[];
    avatar?: {
      url: string;
      imgix_url: string;
    };
    schedule?: {
      [key: string]: {
        available: boolean;
        startTime: string;
        endTime: string;
      };
    };
  };
}

// Utility Types
export type ClientStatus = 'active' | 'inactive' | 'new';
export type ServiceCategory = 'haircut' | 'color' | 'treatment' | 'styling' | 'other';

// Component Props Types
export interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onSendReminder: (client: Client) => void;
}

export interface CalendarProps {
  appointments: CalendarAppointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
}

export interface DashboardStatsProps {
  stats: DashboardStats;
  loading?: boolean;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Type Guards
export function isClient(obj: any): obj is Client {
  return obj && typeof obj._id === 'string' && typeof obj.name === 'string';
}

export function isAppointment(obj: any): obj is CalendarAppointment {
  return obj && typeof obj.id === 'string' && obj.date instanceof Date;
}

// Utility type for MongoDB documents
export type MongoDocument<T> = T & Document;

// Constants as types
export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'] as const;
export const SERVICE_CATEGORIES = ['haircut', 'color', 'treatment', 'styling', 'other'] as const;
export const USER_ROLES = ['admin', 'manager'] as const;