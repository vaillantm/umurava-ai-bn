import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  source: { type: String, required: true, enum: ['manual', 'json', 'csv', 'pdf'] },
  sourceFileName: String,

  
  avatar: {
    url: String,
    publicId: String,
  },

  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    headline: { type: String, required: true },
    bio: String,
    location: { type: String, required: true }
  },

  // ... (keep all your existing fields: skills, languages, experience, etc.)

  skills: [{ name: String, level: String, yearsOfExperience: Number }],
  languages: [{ name: String, proficiency: String }],
  experience: [{ /* your existing experience schema */ }],
  education: [{ /* your existing education schema */ }],
  certifications: [{ /* your existing certifications schema */ }],
  projects: [{ /* your existing projects schema */ }],
  availability: { status: String, type: String, startDate: String },
  socialLinks: { linkedin: String, github: String, portfolio: String }
}, { timestamps: true });

export const Candidate = mongoose.model('Candidate', candidateSchema);