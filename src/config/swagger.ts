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
        Job: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '680a2f0a3a15f2d0f6b1a123' },
            title: { type: 'string', example: 'Senior Backend Engineer' },
            department: { type: 'string', example: 'Engineering' },
            location: { type: 'string', example: 'Kigali, Rwanda' },
            employmentType: { type: 'string', example: 'Full-time' },
            experienceLevel: { type: 'string', example: 'Senior' },
            shortlistSize: { type: 'integer', example: 20 },
            description: { type: 'string' },
            requiredSkills: {
              type: 'array',
              items: { type: 'string' }
            },
            idealCandidateProfile: { type: 'string' },
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
            status: {
              type: 'string',
              enum: ['draft', 'active', 'closed'],
              example: 'active'
            },
            createdBy: { type: 'string', example: '680a2f0a3a15f2d0f6b1a999' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ScreeningResult: {
          type: 'object',
          properties: {
            candidateId: {
              oneOf: [
                { type: 'string', example: '680a2f0a3a15f2d0f6b1a456' },
                {
                  type: 'object',
                  properties: {
                    _id: { type: 'string', example: '680a2f0a3a15f2d0f6b1a456' },
                    personalInfo: {
                      type: 'object',
                      properties: {
                        firstName: { type: 'string', example: 'Amina' },
                        lastName: { type: 'string', example: 'Uwase' }
                      }
                    },
                    avatar: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg'
                        }
                      }
                    }
                  }
                }
              ]
            },
            rank: { type: 'integer', example: 1 },
            score: { type: 'number', example: 89 },
            scoreBreakdown: {
              type: 'object',
              properties: {
                skills: { type: 'number', example: 35 },
                experience: { type: 'number', example: 26 },
                education: { type: 'number', example: 12 },
                projects: { type: 'number', example: 9 },
                certifications: { type: 'number', example: 7 }
              }
            },
            strengths: {
              type: 'array',
              items: { type: 'string' }
            },
            gaps: {
              type: 'array',
              items: { type: 'string' }
            },
            reasoning: { type: 'string' },
            decision: { type: 'string', example: 'shortlisted' }
          }
        },
        Screening: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '680a2f0a3a15f2d0f6b1a789' },
            jobId: { type: 'string', example: '680a2f0a3a15f2d0f6b1a123' },
            results: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ScreeningResult'
              }
            },
            incompleteCandidates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  candidateId: {
                    type: 'string',
                    example: '680a2f0a3a15f2d0f6b1a456'
                  },
                  reason: {
                    type: 'string',
                    example: 'Resume missing required experience details'
                  }
                }
              }
            },
            summary: {
              type: 'string',
              example: 'Top candidates show strong overlap with required backend skills.'
            },
            totalCandidates: { type: 'integer', example: 18 },
            shortlistedCount: { type: 'integer', example: 10 },
            averageScore: { type: 'number', example: 78.4 },
            generatedBy: { type: 'string', example: 'gemini-2.5-pro' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'],   // This scans all your route files for @swagger comments
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
