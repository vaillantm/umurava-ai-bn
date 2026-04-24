import { z } from 'zod';

const jsonLike = (value: unknown) => {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  const looksLikeJson =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'));

  if (!looksLikeJson) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const parseNumber = (value: unknown) => {
  if (typeof value !== 'string') return value;
  if (value.trim() === '') return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const normalizeCandidateInput = (input: unknown, includeDefaults = false) => {
  if (!input || typeof input !== 'object') return input;

  const raw = input as Record<string, unknown>;
  const personalInfoSource = (jsonLike(raw.personalInfo) as Record<string, unknown> | undefined) ?? {};

  const personalInfo = {
    firstName: raw.firstName ?? personalInfoSource.firstName,
    lastName: raw.lastName ?? personalInfoSource.lastName,
    email: raw.email ?? personalInfoSource.email,
    headline: raw.headline ?? personalInfoSource.headline,
    bio: raw.bio ?? personalInfoSource.bio,
    location: raw.location ?? personalInfoSource.location,
  };

  const toArray = (value: unknown) => {
    const parsed = jsonLike(value);
    return Array.isArray(parsed) ? parsed : value;
  };

  return {
    ...raw,
    ...(includeDefaults ? { source: raw.source ?? 'manual' } : {}),
    personalInfo,
    avatar: jsonLike(raw.avatar),
    skills: toArray(raw.skills),
    languages: toArray(raw.languages),
    experience: toArray(raw.experience),
    education: toArray(raw.education),
    certifications: toArray(raw.certifications),
    projects: toArray(raw.projects),
    availability: jsonLike(raw.availability),
    socialLinks: jsonLike(raw.socialLinks),
    shortlistSize: parseNumber(raw.shortlistSize),
    salary: parseNumber(raw.salary),
    aiWeights: jsonLike(raw.aiWeights),
  };
};

const avatarSchema = z
  .object({
    url: z.string().url(),
    publicId: z.string().optional(),
  })
  .optional();

const skillSchema = z.object({
  name: z.string().min(1),
  level: z.string().min(1),
  yearsOfExperience: z.coerce.number().nonnegative(),
});

const languageSchema = z.object({
  name: z.string().min(1),
  proficiency: z.string().min(1),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  isCurrent: z.boolean().optional(),
  yearsOfExperience: z.coerce.number().nonnegative().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  startYear: z.coerce.number().int().min(1900),
  endYear: z.coerce.number().int().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issueDate: z.string().min(1),
});

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  technologies: z.array(z.string()).default([]),
  role: z.string().min(1),
  link: z.string().url().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
});

const availabilitySchema = z.object({
  status: z.string().min(1),
  type: z.string().min(1),
  startDate: z.string().optional(),
});

const socialLinksSchema = z.object({
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});

const candidatePersonalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please provide a valid email'),
  headline: z.string().min(1, 'Headline is required'),
  bio: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

const candidatePersonalInfoUpdateSchema = candidatePersonalInfoSchema.partial();

const candidateCommonSchema = {
  source: z.enum(['manual', 'json', 'csv', 'pdf', 'bulk']),
  sourceFileName: z.string().optional(),
  avatar: avatarSchema,
  skills: z.array(skillSchema).optional(),
  languages: z.array(languageSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  availability: availabilitySchema.optional(),
  socialLinks: socialLinksSchema.optional(),
};

const candidateCreateBodySchema = z.object({
  ...candidateCommonSchema,
  personalInfo: candidatePersonalInfoSchema,
}).passthrough();

const candidateUpdateBodySchema = z.object({
  ...candidateCommonSchema,
  personalInfo: candidatePersonalInfoUpdateSchema.optional(),
}).partial().passthrough();

export const candidateCreateSchema = z.preprocess(
  (input) => normalizeCandidateInput(input, true),
  candidateCreateBodySchema,
);
export const candidateUpdateSchema = z.preprocess(
  (input) => normalizeCandidateInput(input, false),
  candidateUpdateBodySchema,
);

const aiWeightsCreateSchema = z.object({
  skills: z.coerce.number().min(0).max(100).default(40),
  experience: z.coerce.number().min(0).max(100).default(30),
  education: z.coerce.number().min(0).max(100).default(15),
  projects: z.coerce.number().min(0).max(100).default(10),
  certifications: z.coerce.number().min(0).max(100).default(5),
});

const aiWeightsUpdateSchema = z.object({
  skills: z.coerce.number().min(0).max(100).optional(),
  experience: z.coerce.number().min(0).max(100).optional(),
  education: z.coerce.number().min(0).max(100).optional(),
  projects: z.coerce.number().min(0).max(100).optional(),
  certifications: z.coerce.number().min(0).max(100).optional(),
});

const jobCreateBodySchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  department: z.string().optional(),
  location: z.string().optional(),
  salary: z.coerce.number().nonnegative().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).optional(),
  employmentType: z.string().optional(),
  experienceLevel: z.string().optional(),
  shortlistSize: z.coerce.number().int().positive().default(20),
  description: z.string().min(1, 'Description is required'),
  requiredSkills: z.array(z.string()).default([]),
  idealCandidateProfile: z.string().optional(),
  aiWeights: aiWeightsCreateSchema.default({
    skills: 40,
    experience: 30,
    education: 15,
    projects: 10,
    certifications: 5,
  }),
  status: z.enum(['draft', 'active', 'closed']).default('draft'),
}).passthrough();

const jobUpdateBodySchema = z
  .object({
    title: z.string().min(1, 'Job title is required').optional(),
    company: z.string().min(1, 'Company is required').optional(),
    department: z.string().optional(),
    location: z.string().optional(),
    salary: z.coerce.number().nonnegative().optional(),
    jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).optional(),
    employmentType: z.string().optional(),
    experienceLevel: z.string().optional(),
    shortlistSize: z.coerce.number().int().positive().optional(),
    description: z.string().optional(),
    requiredSkills: z.array(z.string()).optional(),
    idealCandidateProfile: z.string().optional(),
    aiWeights: aiWeightsUpdateSchema.optional(),
    status: z.enum(['draft', 'active', 'closed']).optional(),
  })
  .passthrough();

export const jobCreateSchema = jobCreateBodySchema;

export const jobUpdateSchema = jobUpdateBodySchema;

export const screeningRunSchema = z.object({
  jobId: z.string().min(1),
  candidateIds: z.array(z.string().min(1)).min(1, 'At least one candidate is required').optional(),
  shortlistSize: z.coerce.number().int().positive().optional(),
}).refine((data) => Boolean(data.candidateIds?.length) || Boolean(data.jobId), {
  message: 'Provide jobId and optionally candidateIds, or jobId alone to screen all job applications.',
  path: ['jobId'],
});
