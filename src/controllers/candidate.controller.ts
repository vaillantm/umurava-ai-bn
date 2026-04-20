import { Request, Response } from "express";
import { Candidate } from "../models/Candidate.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { candidateSchema } from "../utils/validators.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

const uploadAvatarToCloudinary = async (
  file: Express.Multer.File,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "umurava-candidates",
        transformation: [{ width: 400, height: 400, crop: "fill" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

export const createCandidate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar image file is required" });
    }

    const avatarUrl = await uploadAvatarToCloudinary(req.file);

    const validated = candidateSchema.parse(req.body);

    const candidate = await Candidate.create({
      ...validated,
      source: "manual",
      avatar: { url: avatarUrl },
    });

    res.status(201).json({
      message: "Candidate created successfully. Avatar saved on Cloudinary.",
      candidate,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    let avatarUrl: string | undefined;

    if (req.file) {
      avatarUrl = await uploadAvatarToCloudinary(req.file);
    }

    const validated = candidateSchema.partial().parse(req.body);

    const updateData: any = { ...validated };
    if (avatarUrl) {
      updateData.avatar = { url: avatarUrl };
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      updateData,
      { new: true },
    );

    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    res.json({
      message: "Candidate updated successfully",
      candidate,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCandidates = async (req: AuthRequest, res: Response) => {
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
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.candidateId);
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });
    res.json({ message: "Candidate deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkCreateCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const candidates = Array.isArray(req.body) ? req.body : [req.body];
    const saved = await Candidate.insertMany(
      candidates.map((c) => ({ ...c, source: "bulk" })),
    );
    res.status(201).json({
      message: `${saved.length} candidates created`,
      count: saved.length,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
