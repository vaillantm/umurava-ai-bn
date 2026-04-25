import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { parseResumeWithGemini } from '../services/gemini.js';
import { Candidate } from '../models/Candidate.model.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export const uploadJson = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const data = JSON.parse(req.file.buffer.toString());
    const candidates = Array.isArray(data) ? data : [data];

    const saved = await Candidate.insertMany(
      candidates.map((c: any) => ({
        ...c,
        source: 'json',
        sourceFileName: req.file?.originalname
      }))
    );

    res.status(201).json({
      message: 'JSON candidates uploaded successfully',
      count: saved.length
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Invalid JSON or upload failed', error: error.message });
  }
};

export const uploadCsv = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'CSV upload not fully implemented yet. Use JSON or PDF for the demo.' });
};

// Upload Resume PDF → Cloudinary + Gemini Parse
export const uploadPdf = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    // 1. Upload PDF to Cloudinary (for storage & audit)
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'raw', 
          folder: 'umurava-resumes',
          public_id: `resume-${Date.now()}` 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
    });

    // 2. Parse with Gemini
    const parsedData = await parseResumeWithGemini(req.file.buffer, req.file.mimetype || 'application/pdf');

    // 3. Save candidate with resume URL
    const candidate = await Candidate.create({
      ...parsedData,
      source: 'pdf',
      sourceFileName: req.file.originalname,
      resumeUrl: uploadResult.secure_url   // ← NEW: Save Cloudinary URL
    });

    res.status(201).json({
      message: "Resume PDF uploaded to Cloudinary and parsed successfully",
      candidateId: candidate._id,
      resumeUrl: uploadResult.secure_url,     // Return URL to frontend
      cloudinaryPublicId: uploadResult.public_id
    });
  } catch (error: any) {
    console.error('PDF upload error:', error);
    res.status(500).json({ 
      message: 'PDF processing failed', 
      error: error.message 
    });
  }
};

// ★ NEW: Upload candidate avatar (profile photo)
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'image', 
          folder: 'umurava-avatars',
          transformation: [{ width: 400, height: 400, crop: 'fill' }]
        },
        (error, result) => error ? reject(error) : resolve(result)
      );
      streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
    });

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatar: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Avatar upload failed', error: error.message });
  }
};