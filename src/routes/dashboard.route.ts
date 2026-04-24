import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getDashboardSnapshot } from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard snapshot and summary endpoints
 */

/**
 * @swagger
 * /api/dashboard/snapshot:
 *   get:
 *     summary: Get dashboard snapshot
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data snapshot
 */
router.get('/snapshot', protect, getDashboardSnapshot);

export default router;

