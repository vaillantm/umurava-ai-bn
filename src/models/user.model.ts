import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['recruiter', 'admin'], default: 'recruiter' },
  companyName: { type: String, default: 'Umurava' },
  avatarUrl: String,
  status: { type: String, default: 'active' },
  settings: {
    primaryModel: { type: String, default: 'gemini-2.5-pro' },
    batchOutput: { type: Boolean, default: true },
    explainableStructuring: { type: Boolean, default: true },
    biasDetection: { type: Boolean, default: true },
    promptContext: { type: String, default: '' }
  }
}, { timestamps: true });

userSchema.index({ email: 1, status: 1 });

export const User = mongoose.model('User', userSchema);
