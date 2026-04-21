import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: String, required: true },
    yearsOfExperience: { type: Number, default: 0 },
  },
  { _id: false },
);

const languageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    proficiency: { type: String, required: true },
  },
  { _id: false },
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: String,
    description: String,
    technologies: [{ type: String }],
    isCurrent: { type: Boolean, default: false },
    yearsOfExperience: Number,
  },
  { _id: false },
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: Number,
  },
  { _id: false },
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, required: true },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    role: { type: String, required: true },
    link: String,
    startDate: { type: String, required: true },
    endDate: String,
  },
  { _id: false },
);

const availabilitySchema = new mongoose.Schema(
  {
    status: String,
    type: String,
    startDate: String,
  },
  { _id: false },
);

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: String,
    github: String,
    portfolio: String,
  },
  { _id: false },
);

const candidateSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      enum: ['manual', 'json', 'csv', 'pdf', 'bulk'],
      default: 'manual',
    },
    sourceFileName: String,
    avatar: {
      url: String,
      publicId: String,
    },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, index: true },
      headline: { type: String, required: true },
      bio: String,
      location: { type: String, required: true },
    },
    skills: { type: [skillSchema], default: [] },
    languages: { type: [languageSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    availability: availabilitySchema,
    socialLinks: socialLinksSchema,
  },
  { timestamps: true },
);

export const Candidate = mongoose.model('Candidate', candidateSchema);
