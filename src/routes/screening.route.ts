import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  runScreening,
  getLatestScreening,
  getScreeningById,
  exportScreening
} from '../controllers/screening.controller.js';

const router = Router();

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
 *             required:
 *               - jobId
 *               - candidateIds
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job to screen against
 *                 example: "67f8a1b2c3d4e5f6g7h8i9j0"
 *               candidateIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of candidate IDs to screen
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
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post('/run', protect, runScreening);

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
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Server error
 */
router.get('/:screeningId/export', protect, exportScreening);

export default router;