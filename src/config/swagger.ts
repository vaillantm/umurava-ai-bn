// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Umurava AI Recruiter API',
      version: '1.0.0',
      description: 'AI-powered talent screening backend for Umurava Hackathon 2026',
      contact: {
        name: "Umurava AI Team",
        email: "support@umurava.com"
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local Development Server',
      },
      {
        url: 'https://your-deployed-url.onrender.com', // Change later when deployed
        description: 'Production Server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in format: Bearer <token>'
        }
      },
      schemas: {
        ApiMessage: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/AuthUser' }
          }
        },
        AuthProfileUpdateResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: { $ref: '#/components/schemas/AuthUser' }
          }
        },
        Settings: {
          type: 'object',
          properties: {
            primaryModel: { type: 'string', example: 'gemini-1.5-flash' },
            batchOutput: { type: 'boolean', example: true },
            explainableStructuring: { type: 'boolean', example: true },
            biasDetection: { type: 'boolean', example: true },
            promptContext: { type: 'string', example: 'Prefer concise recruiter-friendly reasoning.' }
          }
        },
        DashboardSnapshot: {
          type: 'object',
          properties: {
            jobs: { type: 'array', items: { $ref: '#/components/schemas/Job' } },
            candidates: { type: 'array', items: { $ref: '#/components/schemas/Candidate' } },
            latestScreening: { oneOf: [{ $ref: '#/components/schemas/Screening' }, { type: 'null' }] }
          }
        },
        AuthUser: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            companyName: { type: 'string' },
            avatarUrl: { type: 'string' },
            status: { type: 'string' },
            settings: { $ref: '#/components/schemas/Settings' }
          }
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9d0' },
            title: { type: 'string', example: 'Senior Backend Engineer' },
            company: { type: 'string', example: 'Umurava' },
            department: { type: 'string', example: 'Engineering' },
            location: { type: 'string', example: 'Kigali, Rwanda' },
            salary: { type: 'number', example: 2500000 },
            jobType: { type: 'string', example: 'full-time' },
            employmentType: { type: 'string', example: 'On-site' },
            experienceLevel: { type: 'string', example: 'Mid-Senior' },
            shortlistSize: { type: 'number', example: 10 },
            description: { type: 'string', example: 'Build and maintain backend services.' },
            requiredSkills: {
              type: 'array',
              items: { type: 'string' },
              example: ['Node.js', 'TypeScript', 'MongoDB']
            },
            idealCandidateProfile: { type: 'string', example: 'Strong API and systems experience.' },
            aiWeights: {
              type: 'object',
              properties: {
                skills: { type: 'number', example: 40 },
                experience: { type: 'number', example: 30 },
                education: { type: 'number', example: 15 },
                projects: { type: 'number', example: 10 },
                certifications: { type: 'number', example: 5 }
              }
            },
            shortlistedCandidates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  candidateId: { type: 'string' },
                  applicationId: { type: 'string' },
                  score: { type: 'number' },
                  rank: { type: 'number' },
                  decision: { type: 'string' },
                  reasoning: { type: 'string' },
                  shortlistedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            status: { type: 'string', example: 'active' },
            createdBy: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9d1' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Candidate: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9e1' },
            source: { type: 'string', example: 'pdf' },
            sourceFileName: { type: 'string', example: 'john-doe-resume.pdf' },
            resumeUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/raw/upload/v1/resume.pdf' },
            resumeText: { type: 'string', example: 'John Doe is a backend engineer with 5 years of experience...' },
            avatar: {
              type: 'object',
              properties: {
                url: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg' },
                publicId: { type: 'string', example: 'umurava-candidates/avatar123' }
              }
            },
            personalInfo: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                email: { type: 'string', example: 'john.doe@email.com' },
                headline: { type: 'string', example: 'Full-Stack Engineer' },
                bio: { type: 'string', example: 'Backend-focused engineer with 5 years experience.' },
                location: { type: 'string', example: 'Kigali, Rwanda' }
              }
            },
            skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Node.js' },
                  level: { type: 'string', example: 'Expert' },
                  yearsOfExperience: { type: 'number', example: 5 }
                }
              }
            },
            languages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'English' },
                  proficiency: { type: 'string', example: 'Fluent' }
                }
              }
            },
            experience: { type: 'array', items: { type: 'object' } },
            education: { type: 'array', items: { type: 'object' } },
            certifications: { type: 'array', items: { type: 'object' } },
            projects: { type: 'array', items: { type: 'object' } },
            availability: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'available' },
                type: { type: 'string', example: 'full-time' },
                startDate: { type: 'string', example: '2026-05-01' }
              }
            },
            socialLinks: {
              type: 'object',
              properties: {
                linkedin: { type: 'string', example: 'https://linkedin.com/in/johndoe' },
                github: { type: 'string', example: 'https://github.com/johndoe' },
                portfolio: { type: 'string', example: 'https://johndoe.dev' }
              }
            },
            score: { type: 'number', example: 87 },
            decision: { type: 'string', example: 'shortlisted' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ScreeningResult: {
          type: 'object',
          properties: {
            candidateId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9e1' },
            rank: { type: 'number', example: 1 },
            score: { type: 'number', example: 92 },
            scoreBreakdown: {
              type: 'object',
              properties: {
                skills: { type: 'number', example: 38 },
                experience: { type: 'number', example: 28 },
                education: { type: 'number', example: 12 },
                projects: { type: 'number', example: 9 },
                certifications: { type: 'number', example: 5 }
              }
            },
            strengths: { type: 'array', items: { type: 'string' }, example: ['Strong Node.js', 'Good API design'] },
            gaps: { type: 'array', items: { type: 'string' }, example: ['Limited cloud experience'] },
            reasoning: { type: 'string', example: 'High skill match and strong delivery history.' },
            decision: { type: 'string', example: 'shortlisted' },
            workflowStatus: { type: 'string', example: 'interview' },
            shortlistLabel: { type: 'string', example: 'Top 10' }
          }
        },
        Screening: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9f9' },
            jobId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9d0' },
            results: {
              type: 'array',
              items: { $ref: '#/components/schemas/ScreeningResult' }
            },
            incompleteCandidates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  candidateId: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            summary: { type: 'string', example: 'Top candidates were shortlisted based on skill overlap and experience.' },
            totalCandidates: { type: 'number', example: 14 },
            shortlistedCount: { type: 'number', example: 10 },
            averageScore: { type: 'number', example: 83.4 },
            generatedBy: { type: 'string', example: 'gemini-2.0-flash' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9fa' },
            jobId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9d0' },
            candidateId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9e1' },
            cvUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/raw/upload/v1/resume.pdf' },
            cvText: { type: 'string', example: 'John Doe is a backend engineer...' },
            sourceFileName: { type: 'string', example: 'john-doe-resume.pdf' },
            status: { type: 'string', example: 'submitted' },
            screeningId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9f9' },
            score: { type: 'number', example: 92 },
            decision: { type: 'string', example: 'shortlisted' },
            reasoning: { type: 'string', example: 'High skill match and strong delivery history.' },
            workflowStatus: { type: 'string', example: 'interview' },
            shortlistLabel: { type: 'string', example: 'Top 10' },
            appliedAt: { type: 'string', format: 'date-time' },
            screenedAt: { type: 'string', format: 'date-time' }
          }
        },
        UploadJsonResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'JSON candidates uploaded successfully for Senior Backend Engineer' },
            jobId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9d0' },
            jobTitle: { type: 'string', example: 'Senior Backend Engineer' },
            candidatesCreated: { type: 'number', example: 25 },
            applicationsCreated: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  candidateId: { type: 'string' },
                  applicationId: { type: 'string' }
                }
              }
            }
          }
        },
        UploadCsvResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'CSV candidates uploaded successfully for Senior Backend Engineer' },
            jobId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9d0' },
            jobTitle: { type: 'string', example: 'Senior Backend Engineer' },
            candidatesCreated: { type: 'number', example: 25 },
            applicationsCreated: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  candidateId: { type: 'string' },
                  applicationId: { type: 'string' }
                }
              }
            }
          }
        },
        UploadPdfResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Resume PDF uploaded to Cloudinary and parsed successfully for Senior Backend Engineer' },
            jobId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9d0' },
            jobTitle: { type: 'string', example: 'Senior Backend Engineer' },
            candidateId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9e1' },
            applicationId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9fa' },
            resumeUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/raw/upload/v1/resume.pdf' },
            cloudinaryPublicId: { type: 'string', example: 'umurava-resumes/resume-1713868800000' }
          }
        },
        BulkPdfResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Bulk upload and screening completed' },
            jobId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9d0' },
            jobTitle: { type: 'string', example: 'Senior Backend Engineer' },
            uploadCount: { type: 'number', example: 5 },
            applicationsCreated: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  candidateId: { type: 'string' },
                  applicationId: { type: 'string' },
                  fileName: { type: 'string' },
                  resumeUrl: { type: 'string' }
                }
              }
            },
            applicationRecords: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
            screeningId: { type: 'string', example: '66f1a1b2c3d4e5f6a7b8c9f9' },
            shortlistedCount: { type: 'number', example: 3 },
            totalCandidates: { type: 'number', example: 5 },
            averageScore: { type: 'number', example: 87.4 }
          }
        },
        UploadAvatarResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Avatar uploaded successfully' },
            avatar: {
              type: 'object',
              properties: {
                url: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg' },
                publicId: { type: 'string', example: 'umurava-avatars/avatar123' }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'],   // This scans all your route files for @swagger comments
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
