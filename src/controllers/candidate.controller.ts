import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { Candidate } from '../models/Candidate.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { candidateCreateSchema, candidateUpdateSchema } from '../utils/validators.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

type UploadedAvatar = {
  url: string;
  publicId: string;
};

const uploadAvatarToCloudinary = async (
  file: Express.Multer.File,
): Promise<UploadedAvatar> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'umurava-candidates',
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

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

export const createCandidate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Avatar image file is required' });
    }

    const avatar = await uploadAvatarToCloudinary(req.file);
    const candidatePayload = candidateCreateSchema.parse(req.body);

    const candidate = await Candidate.create({
      ...candidatePayload,
      avatar,
      source: candidatePayload.source ?? 'manual',
    });

    res.status(201).json({
      message: 'Candidate created successfully',
      candidate,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    res.status(500).json({ message: error.message });
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const candidatePayload = candidateUpdateSchema.parse(req.body);
    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const updateData: Record<string, unknown> = { ...candidatePayload };

    if (candidatePayload.personalInfo) {
      updateData.personalInfo = {
        ...candidate.personalInfo,
        ...candidatePayload.personalInfo,
      };
    }

    if (candidatePayload.availability) {
      updateData.availability = {
        ...(candidate.availability || {}),
        ...candidatePayload.availability,
      };
    }

    if (candidatePayload.socialLinks) {
      updateData.socialLinks = {
        ...(candidate.socialLinks || {}),
        ...candidatePayload.socialLinks,
      };
    }

    if (req.file) {
      updateData.avatar = await uploadAvatarToCloudinary(req.file);
    }

    candidate.set(updateData);
    await candidate.save();

    res.json({
      message: 'Candidate updated successfully',
      candidate,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    res.status(400).json({ message: error.message });
  }
};

export const getCandidates = async (_req: AuthRequest, res: Response) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidateById = async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Candidate deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkCreateCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];

    const candidates = items.map((item) => ({
      ...candidateCreateSchema.parse(item),
      source: 'bulk' as const,
    }));

    const saved = await Candidate.insertMany(candidates);

    res.status(201).json({
      message: `${saved.length} candidates created`,
      count: saved.length,
      candidates: saved,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    res.status(400).json({ message: error.message });
  }
};
