import mongoose, { Schema, model, models } from 'mongoose'
import { Client, AppointmentHistory } from '@/types'

const AppointmentHistorySchema = new Schema<AppointmentHistory>({
  date: { type: Date, required: true },
  service: { type: String, required: true },
  price: { type: Number },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  }
}, { _id: true })

const ClientSchema = new Schema<Client>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please enter a valid mobile number'
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  servicesTaken: [{
    type: String,
    required: true
  }],
  lastVisit: {
    type: Date,
    required: true,
    default: Date.now
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  appointmentHistory: [AppointmentHistorySchema],
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Pre-save middleware to calculate next due date
ClientSchema.pre('save', function(next) {
  if (this.isModified('lastVisit') || this.isNew) {
    const nextDue = new Date(this.lastVisit);
    nextDue.setDate(nextDue.getDate() + 30); // 30 days from last visit
    this.nextDueDate = nextDue;
  }
  next();
})

// Virtual to check if client is overdue
ClientSchema.virtual('isOverdue').get(function() {
  return this.nextDueDate < new Date();
})

// Virtual to get days until next appointment
ClientSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const diffTime = this.nextDueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
})

// Index for better query performance
ClientSchema.index({ mobile: 1 })
ClientSchema.index({ email: 1 })
ClientSchema.index({ nextDueDate: 1 })
ClientSchema.index({ 'servicesTaken': 1 })

// Static method to find clients due for appointment
ClientSchema.statics.findDueClients = function(daysAhead = 3) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  return this.find({
    nextDueDate: {
      $gte: today,
      $lte: futureDate
    }
  }).sort({ nextDueDate: 1 });
}

// Static method to find overdue clients
ClientSchema.statics.findOverdueClients = function() {
  const today = new Date();
  return this.find({
    nextDueDate: { $lt: today }
  }).sort({ nextDueDate: 1 });
}

// Method to add appointment to history
ClientSchema.methods.addAppointment = function(appointmentData: Omit<AppointmentHistory, '_id'>) {
  this.appointmentHistory.push(appointmentData);
  this.lastVisit = appointmentData.date;
  return this.save();
}

const ClientModel = models.Client || model<Client>('Client', ClientSchema)

export default ClientModel