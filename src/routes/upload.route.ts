import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import {
  uploadJson,
  uploadCsv,
  uploadPdf,
  uploadBulkPdf,
  uploadAvatar
} from '../controllers/upload.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload endpoints (JSON, CSV, PDF resumes, and Avatars)
 */

/**
 * @swagger
 * /api/uploads/json:
 *   post:
 *     summary: Upload candidates from JSON file
 *     tags: [Uploads]
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
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: Job ID the uploaded CVs belong to
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: JSON file containing candidate data
 *     responses:
 *       201:
 *         description: Candidates uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadJsonResponse'
 *             examples:
 *               sample:
 *                 value:
 *                   message: JSON candidates uploaded successfully for Senior Backend Engineer
 *                   jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                   jobTitle: Senior Backend Engineer
 *                   candidatesCreated: 25
 *       400:
 *         description: No file uploaded or invalid JSON
 */
router.post('/json', protect, upload.single('file'), uploadJson);

/**
 * @swagger
 * /api/uploads/csv:
 *   post:
 *     summary: Upload candidates from CSV file
 *     tags: [Uploads]
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
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: Job ID the CSV candidates belong to
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing candidate data
 *     responses:
 *       201:
 *         description: CSV candidates uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadCsvResponse'
 *             examples:
 *               sample:
 *                 value:
 *                   message: CSV candidates uploaded successfully for Senior Backend Engineer
 *                   jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                   jobTitle: Senior Backend Engineer
 *                   candidatesCreated: 25
 *       400:
 *         description: No file uploaded
 */
router.post('/csv', protect, upload.single('file'), uploadCsv);

/**
 * @swagger
 * /api/uploads/pdf:
 *   post:
 *     summary: Upload resume PDF and parse with Gemini
 *     tags: [Uploads]
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
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: Job ID the uploaded resume belongs to
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF resume file
 *     responses:
 *       201:
 *         description: PDF uploaded and parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadPdfResponse'
 *             examples:
 *               sample:
 *                 value:
 *                   message: Resume PDF uploaded to Cloudinary and parsed successfully for Senior Backend Engineer
 *                   jobId: 66f1a1b2c3d4e5f6a7b8c9d0
 *                   jobTitle: Senior Backend Engineer
 *                   candidateId: 66f1a1b2c3d4e5f6a7b8c9e1
 *                   applicationId: 66f1a1b2c3d4e5f6a7b8c9fa
 *                   resumeUrl: https://res.cloudinary.com/demo/raw/upload/v1/resume.pdf
 *                   cloudinaryPublicId: umurava-resumes/resume-1713868800000
 *       400:
 *         description: No PDF file uploaded
 *       500:
 *         description: PDF processing failed
 */
router.post('/pdf', protect, upload.single('file'), uploadPdf);

/**
 * @swagger
 * /api/uploads/bulk-pdf:
 *   post:
 *     summary: Upload multiple resume PDFs and parse them
 *     tags: [Uploads]
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
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: Job ID the resumes belong to
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple PDF resume files
 *     responses:
 *       201:
 *         description: PDFs uploaded and parsed successfully
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
 *                   shortlistedCount: 3
 */
router.post('/bulk-pdf', protect, upload.array('files', 50), uploadBulkPdf);

/**
 * @swagger
 * /api/uploads/avatar:
 *   post:
 *     summary: Upload candidate avatar (profile picture)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadAvatarResponse'
 *             examples:
 *               sample:
 *                 value:
 *                   message: Avatar uploaded successfully
 *                   avatar:
 *                     url: https://res.cloudinary.com/demo/image/upload/avatar.jpg
 *                     publicId: umurava-avatars/avatar123
 *       400:
 *         description: No image file uploaded
 *       500:
 *         description: Avatar upload failed
 */
router.post('/avatar', protect, upload.single('file'), uploadAvatar);

export default router;
