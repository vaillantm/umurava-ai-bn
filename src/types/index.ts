export interface PersonalInfo { firstName: string; lastName: string; email: string; headline: string; bio?: string; location: string; }
export interface Skill { name: string; level: string; yearsOfExperience: number; }
export interface Language { name: string; proficiency: string; }
export interface Experience { company: string; role: string; startDate: string; endDate?: string; description: string; technologies: string[]; isCurrent: boolean; }
export interface Education { institution: string; degree: string; fieldOfStudy: string; startYear: number; endYear?: number; }
export interface Certification { name: string; issuer: string; issueDate: string; }
export interface Project { name: string; description: string; technologies: string[]; role: string; link?: string; startDate: string; endDate?: string; }
export interface Availability { status: string; type: string; startDate?: string; }
export interface SocialLinks { linkedin?: string; github?: string; portfolio?: string; }

export interface CandidateSchema {
  source: string;
  sourceFileName?: string;
  personalInfo: PersonalInfo;
  skills: Skill[];
  languages: Language[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  availability: Availability;
  socialLinks: SocialLinks;
}