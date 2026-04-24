import mongoose from 'mongoose';

const aiWeightsSchema = new mongoose.Schema(
  {
    skills: { type: Number, default: 40 },
    experience: { type: Number, default: 30 },
    education: { type: Number, default: 15 },
    projects: { type: Number, default: 10 },
    certifications: { type: Number, default: 5 },
  },
  { _id: false },
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    salary: { type: Number },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    },
    employmentType: { type: String, trim: true },
    experienceLevel: { type: String, trim: true },
    shortlistSize: { type: Number, default: 20 },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    idealCandidateProfile: { type: String },
    aiWeights: { type: aiWeightsSchema, default: () => ({}) },
    shortlistedCandidates: [{
      candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
      score: Number,
      rank: Number,
      decision: String,
      reasoning: String,
      shortlistedAt: { type: Date, default: Date.now },
    }],
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Job = mongoose.model('Job', jobSchema);
