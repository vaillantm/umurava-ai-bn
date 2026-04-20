// src/routes/candidate.route.ts
import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { candidateSchema } from '../utils/validators.js';
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  bulkCreateCandidates
} from '../controllers/candidate.controller.js';

const router = Router();

// Multer setup for avatar upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Manage candidates (recruiter only)
 */

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create a new candidate (Manual Entry)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     description: |
 *       Create a candidate manually. 
 *       You MUST upload an avatar image file.
 *       Personal info can be sent as flat fields or nested under "personalInfo".
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Candidate profile photo (REQUIRED - will be saved on Cloudinary)
 *               firstName:
 *                 type: string
 *                 example: "Kalisa"
 *               lastName:
 *                 type: string
 *                 example: "Aime"
 *               email:
 *                 type: string
 *                 example: "kalisa.aime@umurava.com"
 *               headline:
 *                 type: string
 *                 example: "Senior Backend Engineer"
 *               bio:
 *                 type: string
 *                 example: "Experienced developer with passion for AI"
 *               location:
 *                 type: string
 *                 example: "Kigali, Rwanda"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: [{"name": "Node.js", "level": "Expert", "yearsOfExperience": 5}]
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       400:
 *         description: Avatar file is required or validation error
 */
router.post('/', upload.single('avatar'), validate(candidateSchema), createCandidate);

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all candidates
 */
router.get('/', getCandidates);

/**
 * @swagger
 * /api/candidates/{candidateId}:
 *   get:
 *     summary: Get a single candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate details
 *       404:
 *         description: Candidate not found
 */
router.get('/:candidateId', getCandidateById);

/**
 * @swagger
 * /api/candidates/{candidateId}:
 *   patch:
 *     summary: Update an existing candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: New avatar image (optional)
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               headline:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *       404:
 *         description: Candidate not found
 */
router.patch('/:candidateId', upload.single('avatar'), validate(candidateSchema.partial()), updateCandidate);

/**
 * @swagger
 * /api/candidates/{candidateId}:
 *   delete:
 *     summary: Delete a candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 */
router.delete('/:candidateId', deleteCandidate);

/**
 * @swagger
 * /api/candidates/bulk:
 *   post:
 *     summary: Bulk create candidates from JSON array
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       201:
 *         description: Bulk candidates created
 */
router.post('/bulk', bulkCreateCandidates);

export default router;