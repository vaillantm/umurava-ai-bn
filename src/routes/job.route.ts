import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { jobCreateSchema, jobUpdateSchema } from '../utils/validators.js';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} from '../controllers/job.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management endpoints
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - company
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               description:
 *                 type: string
 *                 example: "We are looking for a talented backend developer..."
 *               company:
 *                 type: string
 *                 example: "TechVision Inc."
 *               location:
 *                 type: string
 *                 example: "Kigali, Rwanda"
 *               salary:
 *                 type: number
 *                 example: 2500000
 *               jobType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship, freelance]
 *                 example: "full-time"
 *               experienceLevel:
 *                 type: string
 *                 example: "Mid-Senior Level"
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request
 */
router.post('/', protect, validate(jobCreateSchema), createJob);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs created by the authenticated user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       500:
 *         description: Server error
 */
router.get('/', protect, getJobs);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   get:
 *     summary: Get a specific job by ID
 *     tags: [Jobs]
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
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get('/:jobId', protect, getJobById);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   patch:
 *     summary: Update a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               salary:
 *                 type: number
 *               jobType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship, freelance]
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       400:
 *         description: Bad request
 */
router.patch('/:jobId', protect, validate(jobUpdateSchema), updateJob);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job deleted"
 *       404:
 *         description: Job not found
 */
router.delete('/:jobId', protect, deleteJob);

export default router;
