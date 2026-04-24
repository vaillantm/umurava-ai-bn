import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true, index: true },
    cvUrl: { type: String, required: true },
    cvText: { type: String, default: '' },
    sourceFileName: { type: String },
    status: {
      type: String,
      enum: ['submitted', 'screened', 'shortlisted', 'manual_review'],
      default: 'submitted',
      index: true,
    },
    screeningId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening' },
    score: { type: Number },
    decision: { type: String },
    reasoning: { type: String },
    workflowStatus: { type: String },
    shortlistLabel: { type: String },
    appliedAt: { type: Date, default: Date.now },
    screenedAt: { type: Date },
  },
  { timestamps: true },
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
