import mongoose from 'mongoose';

const screeningSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  results: [{
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    rank: Number,
    score: Number,
    scoreBreakdown: {
      skills: Number,
      experience: Number,
      education: Number,
      projects: Number,
      certifications: Number
    },
    strengths: [String],
    gaps: [String],
    reasoning: String,
    decision: { type: String, default: 'shortlisted' }
  }],
  incompleteCandidates: [{
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    reason: String
  }],
  summary: String,
  totalCandidates: Number,
  shortlistedCount: Number,
  averageScore: Number,
  generatedBy: String
}, { timestamps: true });

export const Screening = mongoose.model('Screening', screeningSchema);