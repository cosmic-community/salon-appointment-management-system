import mongoose, { Schema, model, models } from 'mongoose'
import bcrypt from 'bcryptjs'
import { AdminUser } from '@/types'

interface AdminDocument extends AdminUser, mongoose.Document {
  comparePassword(candidatePassword: string): Promise<boolean>
  updateLastLogin(): Promise<AdminDocument>
}

const AdminSchema = new Schema<AdminDocument>({
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
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      // Remove password from JSON output, but keep it available for deletion if needed
      const { password, ...result } = ret;
      return result;
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

const AdminModel = models.Admin || model<AdminDocument>('Admin', AdminSchema)

export default AdminModel