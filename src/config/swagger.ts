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
      }
    }
  },
  apis: ['./src/routes/*.ts'],   // This scans all your route files for @swagger comments
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };