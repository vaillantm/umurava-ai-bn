import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import {
  uploadJson,
  uploadCsv,
  uploadPdf,
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
 *             properties:
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
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
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing candidate data
 *     responses:
 *       501:
 *         description: Not implemented yet
 *       400:
 *         description: No file uploaded
 */
router.post('/csv', protect, upload.single('file'), uploadCsv);

/**
 * @swagger
 * /api/uploads/pdf:
 *   post:
 *     summary: Upload resume PDF → Store on Cloudinary + Parse with Gemini
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
 *                 description: PDF resume file
 *     responses:
 *       201:
 *         description: PDF uploaded and parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidateId:
 *                   type: string
 *                 resumeUrl:
 *                   type: string
 *                   description: Cloudinary secure URL
 *                 cloudinaryPublicId:
 *                   type: string
 *       400:
 *         description: No PDF file uploaded
 *       500:
 *         description: PDF processing failed
 */
router.post('/pdf', protect, upload.single('file'), uploadPdf);

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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 avatar:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: Cloudinary secure URL
 *                     publicId:
 *                       type: string
 *       400:
 *         description: No image file uploaded
 *       500:
 *         description: Avatar upload failed
 */
router.post('/avatar', protect, upload.single('file'), uploadAvatar);

export default router;