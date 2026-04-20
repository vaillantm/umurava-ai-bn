import { z } from 'zod';

export const candidateSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    headline: z.string().min(1),
    bio: z.string().optional(),
    location: z.string().min(1)
  }),
  avatar: z.object({ url: z.string(), publicId: z.string() }).optional(),
  skills: z.array(z.object({ name: z.string(), level: z.string(), yearsOfExperience: z.number() })).optional(),
  // Add other fields as needed (experience, education, etc.) – keep it simple for now
  source: z.enum(['manual', 'json', 'csv', 'pdf']).optional()
}).passthrough();