import mongoose, { Schema, model, models } from 'mongoose'
import bcrypt from 'bcryptjs'
import { AdminUser } from '@/types'

const AdminSchema = new Schema<AdminUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'manager'],
    default: 'admin'
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
})

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
})

// Method to compare passwords
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
}

// Method to update last login
AdminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
}

const AdminModel = models.Admin || model<AdminUser>('Admin', AdminSchema)

export default AdminModel