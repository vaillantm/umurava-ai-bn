import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { z } from 'zod';
import { User } from '../models/user.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { getCachedAuthUser, setCachedAuthUser } from '../services/auth-cache.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().optional().default('Umurava'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z
  .object({
    fullName: z.string().min(3).optional(),
    companyName: z.string().optional(),
  })
  .passthrough();

const settingsSchema = z.object({
  primaryModel: z.string().min(1).optional(),
  batchOutput: z.boolean().optional(),
  explainableStructuring: z.boolean().optional(),
  biasDetection: z.boolean().optional(),
  promptContext: z.string().optional(),
});

const issueToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
};

const serializeUser = (user: any) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  companyName: user.companyName,
  avatarUrl: user.avatarUrl,
  status: user.status,
  settings: user.settings,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const uploadAvatarToCloudinary = async (file: Express.Multer.File) => {
  return new Promise<{ url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'umurava-avatars',
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload failed'));
          return;
        }

        resolve({ url: result.secure_url });
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 4);

    const user = await User.create({
      fullName: data.fullName,
      email,
      passwordHash,
      companyName: data.companyName,
      role: 'recruiter',
      status: 'active',
      settings: {
        primaryModel: 'gemini-1.5-flash',
        batchOutput: true,
        explainableStructuring: true,
        biasDetection: true,
        promptContext: '',
      },
    });

    setCachedAuthUser({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      passwordHash,
    });

    const token = issueToken(user._id.toString(), user.role);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: serializeUser(user),
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const data = loginSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    let user = getCachedAuthUser(email);

    if (!user) {
      user = await User.findOne({ email })
        .select('_id passwordHash role fullName email companyName avatarUrl status')
        .lean()
        .exec();
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!getCachedAuthUser(email)) {
      setCachedAuthUser({
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        passwordHash: user.passwordHash,
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    console.log(`Login completed in ${Date.now() - start}ms`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    console.log(`Login failed in ${Date.now() - start}ms:`, error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(serializeUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (_req: AuthRequest, res: Response) => {
  res.json({
    message: 'Logged out successfully. Please remove token from client storage.',
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updatePayload: Record<string, unknown> = { ...data };

    if (req.file) {
      const avatar = await uploadAvatarToCloudinary(req.file);
      updatePayload.avatarUrl = avatar.url;
    }

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: updatePayload },
      { new: true },
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: serializeUser(user),
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('settings');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.settings || {});
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const data = settingsSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: { settings: data } },
      { new: true },
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings || {},
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = z.string().email().parse(req.body?.email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Password reset instructions sent',
      email,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};
