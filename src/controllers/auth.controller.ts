import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// ====================== VALIDATION SCHEMAS ======================
const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().optional().default("Umurava")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

const updateProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  companyName: z.string().optional(),
}).passthrough();   // No avatarUrl in schema anymore

// ====================== HELPER: Upload Avatar to Cloudinary ======================
const uploadAvatarToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'umurava-avatars',
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// ====================== ENDPOINTS ======================

// 1. REGISTER (kept simple - no avatar during registration)
export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      companyName: data.companyName,
      role: "recruiter",
      status: "active"
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      }
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// 2. LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Login failed" });
  }
};

// 3. GET ME
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 4. LOGOUT
export const logout = async (req: AuthRequest, res: Response) => {
  res.json({
    message:
      "Logged out successfully. Please remove token from client storage.",
  });
};

// 5. UPDATE PROFILE 
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    // Upload file to Cloudinary
    const avatarUrl = await uploadAvatarToCloudinary(req.file);

    // Validate other fields (optional)
    const data = updateProfileSchema.parse(req.body);

    const updatePayload: any = { 
      ...data,
      avatarUrl   // Always save the Cloudinary URL
    };

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: updatePayload },
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully. Avatar saved on Cloudinary.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};