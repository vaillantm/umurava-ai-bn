import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { screeningRunSchema } from '../utils/validators.js';
import {
  runScreening,
  runBulkScreening,
  getLatestScreening,
  getLatestScreeningByQuery,
  getScreeningById,
  exportScreening
} from '../controllers/screening.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Screenings
 *   description: AI-powered candidate screening and shortlisting
 */

/**
 * @swagger
 * /api/screenings/run:
 *   post:
 *     summary: Run AI screening on candidates for a specific job
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job to screen against
 *                 example: "67f8a1b2c3d4e5f6g7h8i9j0"
 *               candidateIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional array of candidate IDs to screen. If omitted, all applications for the job are screened.
 *                 example: ["67f8a1b2c3d4e5f6g7h8i9j1", "67f8a1b2c3d4e5f6g7h8i9j2"]
 *               shortlistSize:
 *                 type: number
 *                 default: 20
 *                 description: Maximum number of candidates to return in shortlist
 *     responses:
 *       200:
 *         description: Screening completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 *                 totalCandidates:
 *                   type: integer
 *                 shortlistedCount:
 *                   type: integer
 *                 averageScore:
 *                   type: number
 *                 usedFallback:
 *                   type: boolean
 *                 summary:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScreeningResult'
 *             examples:
 *               sample:
 *                 value:
 *                   jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                   totalCandidates: 14
 *                   shortlistedCount: 10
 *                   averageScore: 83.4
 *                   usedFallback: false
 *                   summary: Top candidates were shortlisted based on skill overlap and experience.
 *                   results:
 *                     - candidateId: 66f1a1b2c3d4e5f6a7b8c9e1
 *                       rank: 1
 *                       score: 92
 *                       scoreBreakdown:
 *                         skills: 38
 *                         experience: 28
 *                         education: 12
 *                         projects: 9
 *                         certifications: 5
 *                       strengths: [Strong Node.js, Good API design]
 *                       gaps: [Limited cloud experience]
 *                       reasoning: High skill match and strong delivery history.
 *                       decision: shortlisted
 *                   incompleteCandidates:
 *                     - candidateId: 66f1a1b2c3d4e5f6a7b8c9e2
 *                       reason: Missing required personal information or resume fields.
 *                   screeningId: 66f1a1b2c3d4e5f6a7b8c9f9
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post('/run', protect, validate(screeningRunSchema), runScreening);

/**
 * @swagger
 * /api/screenings/bulk-run:
 *   post:
 *     summary: Upload multiple PDFs and run AI screening immediately for a job
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - files
 *             properties:
 *               jobId:
 *                 type: string
 *               shortlistSize:
 *                 type: number
 *                 default: 20
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Bulk upload and screening completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkPdfResponse'
 *             examples:
 *               sample:
 *                 value:
 *                   message: Bulk upload and screening completed
 *                   jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                   jobTitle: Senior Backend Engineer
 *                   uploadCount: 5
 *                   applicationsCreated:
 *                     - candidateId: 66f1a1b2c3d4e5f6a7b8c9e1
 *                       applicationId: 66f1a1b2c3d4e5f6a7b8c9fa
 *                       fileName: john-doe.pdf
 *                       resumeUrl: https://res.cloudinary.com/demo/raw/upload/v1/resume.pdf
 *                   applicationRecords:
 *                     - id: 66f1a1b2c3d4e5f6a7b8c9fa
 *                       jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                       candidateId: 66f1a1b2c3d4e5f6a7b8c9e1
 *                       status: submitted
 *                       cvUrl: https://res.cloudinary.com/demo/raw/upload/v1/resume.pdf
 *                   shortlistedCount: 3
 *                   totalCandidates: 5
 *                   screeningId: 66f1a1b2c3d4e5f6a7b8c9f9
 */
router.post('/bulk-run', protect, upload.array('files', 50), runBulkScreening);

/**
 * @swagger
 * /api/screenings/latest:
 *   get:
 *     summary: Get the most recent screening for a job using query param
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Latest screening result
 *       400:
 *         description: jobId is required
 *       404:
 *         description: No screening found for this job
 */
router.get('/latest', protect, getLatestScreeningByQuery);

/**
 * @swagger
 * /api/screenings/jobs/{jobId}/latest:
 *   get:
 *     summary: Get the most recent screening for a job
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Latest screening result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *             examples:
 *               sample:
 *                 value:
 *                   id: 66f1a1b2c3d4e5f6a7b8c9f9
 *                   jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                   results: []
 *                   incompleteCandidates: []
 *                   summary: Latest screening result.
 *                   totalCandidates: 14
 *                   shortlistedCount: 10
 *                   averageScore: 83.4
 *       404:
 *         description: No screening found for this job
 *       500:
 *         description: Server error
 */
router.get('/jobs/:jobId/latest', protect, getLatestScreening);

/**
 * @swagger
 * /api/screenings/{screeningId}:
 *   get:
 *     summary: Get a specific screening by ID
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         schema:
 *           type: string
 *         description: Screening ID
 *     responses:
 *       200:
 *         description: Screening details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *             examples:
 *               sample:
 *                 value:
 *                   id: 66f1a1b2c3d4e5f6a7b8c9f9
 *                   jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                   results: []
 *                   incompleteCandidates: []
 *                   summary: Screening details.
 *                   totalCandidates: 14
 *                   shortlistedCount: 10
 *                   averageScore: 83.4
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Server error
 */
router.get('/:screeningId', protect, getScreeningById);

/**
 * @swagger
 * /api/screenings/{screeningId}/export:
 *   get:
 *     summary: Export screening results as JSON
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         schema:
 *           type: string
 *         description: Screening ID
 *     responses:
 *       200:
 *         description: Screening exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 *                 summary:
 *                   type: string
 *                 shortlisted:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScreeningResult'
 *                 incomplete:
 *                   type: array
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *             examples:
 *               sample:
 *                 value:
 *                   jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                   summary: Exported shortlist for review.
 *                   shortlisted:
 *                     - candidateId: 66f1a1b2c3d4e5f6a7b8c9e1
 *                       rank: 1
 *                       score: 92
 *                       scoreBreakdown:
 *                         skills: 38
 *                         experience: 28
 *                         education: 12
 *                         projects: 9
 *                         certifications: 5
 *                       strengths: [Strong Node.js]
 *                       gaps: [Limited cloud experience]
 *                       reasoning: High skill match.
 *                       decision: shortlisted
 *                   incomplete: []
 *                   generatedAt: 2026-04-23T00:00:00.000Z
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Server error
 */
router.get('/:screeningId/export', protect, exportScreening);

export default router;
