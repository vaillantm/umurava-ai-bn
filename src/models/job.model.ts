import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: String,
  location: String,
  employmentType: String,
  experienceLevel: String,
  shortlistSize: { type: Number, default: 20 },
  description: String,
  requiredSkills: [{ type: String }],
  idealCandidateProfile: String,
  aiWeights: {
    skills: { type: Number, default: 40 },
    experience: { type: Number, default: 30 },
    education: { type: Number, default: 15 },
    projects: { type: Number, default: 10 },
    certifications: { type: Number, default: 5 }
  },
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema);