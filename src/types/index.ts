export type UserRole = 'recruiter' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyName?: string;
  avatarUrl?: string;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
}

export interface Skill {
  name: string;
  level: string;
  yearsOfExperience: number;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
  isCurrent?: boolean;
  yearsOfExperience?: number;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string;
  endDate?: string;
}

export interface Availability {
  status: string;
  type: string;
  startDate?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface CandidateAvatar {
  url: string;
  publicId?: string;
}

export interface CandidateRecord {
  id?: string;
  source: 'manual' | 'json' | 'csv' | 'pdf' | 'bulk';
  sourceFileName?: string;
  avatar?: CandidateAvatar;
  personalInfo: PersonalInfo;
  skills?: Skill[];
  languages?: Language[];
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  projects?: Project[];
  availability?: Availability;
  socialLinks?: SocialLinks;
  createdAt?: string;
  updatedAt?: string;
}

export type CandidateSchema = CandidateRecord;

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type JobStatus = 'draft' | 'active' | 'closed';

export interface JobWeights {
  skills: number;
  experience: number;
  education: number;
  projects: number;
  certifications: number;
}

export interface JobRecord {
  id?: string;
  title: string;
  company: string;
  department?: string;
  location?: string;
  salary?: number;
  jobType?: JobType;
  employmentType?: string;
  experienceLevel?: string;
  shortlistSize?: number;
  description?: string;
  requiredSkills?: string[];
  idealCandidateProfile?: string;
  aiWeights?: JobWeights;
  status?: JobStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScreeningResult {
  candidateId: string;
  rank: number;
  score: number;
  scoreBreakdown: Partial<JobWeights>;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  decision: 'shortlisted' | 'review' | 'rejected';
}

export interface ScreeningRecord {
  id?: string;
  jobId: string;
  results: ScreeningResult[];
  incompleteCandidates: Array<{ candidateId: string; reason: string }>;
  summary: string;
  totalCandidates: number;
  shortlistedCount: number;
  averageScore: number;
  generatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
