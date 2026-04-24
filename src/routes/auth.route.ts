// src/routes/auth.route.ts
import { Router } from "express";
import multer from "multer";
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  getSettings,
  updateSettings,
  forgotPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Multer setup - only for avatar upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & User Management
 */

// ====================== PUBLIC ROUTES ======================
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new recruiter
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string, example: "Alice Uwimana" }
 *               email: { type: string, format: email, example: "alice@umurava.com" }
 *               password: { type: string, format: password, example: "StrongPass123!" }
 *               companyName: { type: string, example: "Umurava" }
 *     responses:
 *       201: { description: "User registered successfully" }
 *       409: { description: "User already exists" }
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "alice@umurava.com" }
 *               password: { type: string, format: password, example: "StrongPass123!" }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               message: "Login successful"
 *               token: "eyJhbGciOiJIUzI1NiIs..."
 *               user:
 *                 id: "66b1f0a8c8f1a9d3a2f7c001"
 *                 fullName: "Alice Uwimana"
 *                 email: "alice@umurava.com"
 *                 role: "recruiter"
 *                 companyName: "Umurava"
 *                 avatarUrl: "https://res.cloudinary.com/demo/image/upload/v1/avatar.png"
 *                 status: "active"
 *       401: { description: "Invalid credentials" }
 */
router.post("/login", login);

// ====================== PROTECTED ROUTES ======================
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Current user profile" }
 *       401: { description: "Not authorized" }
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (client-side token removal)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Logout successful" }
 */
router.post("/logout", protect, logout);

/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     summary: Update user profile (avatar upload is optional)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               companyName: { type: string }
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: "Profile picture (optional - saved on Cloudinary if provided)"
 *     responses:
 *       200: { description: "Profile updated successfully" }
 *       400: { description: "Avatar file is required" }
 */
router.patch("/profile", protect, upload.single("avatar"), updateProfile);

router.get("/settings", protect, getSettings);
router.patch("/settings", protect, updateSettings);

router.post("/forgot-password", forgotPassword);

export default router;
