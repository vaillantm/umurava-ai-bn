import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import { parse as parseCsv } from 'csv-parse/sync';
import pdfParse from 'pdf-parse';
import { parseResumeWithGemini } from '../services/gemini.js';
import { Candidate } from '../models/Candidate.model.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/Application.model.js';
import { candidateCreateSchema } from '../utils/validators.js';

export const uploadJson = async (req: Request, res: Response) => {
  try {
    const jobId = (req.body?.jobId || req.query?.jobId) as string | undefined;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const rawCandidates =
      req.body?.candidates ??
      req.body?.candidate ??
      req.body?.data ??
      req.body;

    let candidates: unknown[] = [];

    if (req.file) {
      const data = JSON.parse(req.file.buffer.toString());
      candidates = Array.isArray(data) ? data : [data];
    } else if (typeof rawCandidates === 'string') {
      const parsed = JSON.parse(rawCandidates);
      candidates = Array.isArray(parsed) ? parsed : [parsed];
    } else if (Array.isArray(rawCandidates)) {
      candidates = rawCandidates;
    } else if (rawCandidates && typeof rawCandidates === 'object') {
      candidates = Array.isArray((rawCandidates as Record<string, unknown>).candidates)
        ? (rawCandidates as Record<string, unknown>).candidates as unknown[]
        : [rawCandidates];
    }

    if (candidates.length === 0) {
      return res.status(400).json({
        message: 'No candidate JSON found',
        hint: 'Send a JSON file in multipart/form-data as `file`, or send `candidates` as a JSON string/object in multipart/form-data.',
      });
    }

    const applicationsCreated: any[] = [];
    const savedCandidates: any[] = [];

    for (const candidate of candidates) {
      const validatedCandidate = candidateCreateSchema.parse({
        ...(candidate as Record<string, unknown>),
        source: 'json',
        sourceFileName: req.file?.originalname || 'inline-json',
      });

      const savedCandidate = await Candidate.findOneAndUpdate(
        { 'personalInfo.email': validatedCandidate.personalInfo.email },
        { $set: validatedCandidate },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      if (!savedCandidate) {
        throw new Error('Failed to save candidate');
      }

      savedCandidates.push(savedCandidate);

      const application = await Application.findOneAndUpdate(
        { jobId, candidateId: savedCandidate._id },
        {
          $set: {
            jobId,
            candidateId: savedCandidate._id,
            cvUrl: savedCandidate.resumeUrl || req.file?.originalname || 'inline-json',
            cvText: savedCandidate.resumeText || JSON.stringify(validatedCandidate),
            sourceFileName: req.file?.originalname || 'inline-json',
            status: 'submitted',
          },
          $setOnInsert: { appliedAt: new Date() },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      if (!application) {
        throw new Error('Failed to save application');
      }

      applicationsCreated.push({
        candidateId: savedCandidate._id.toString(),
        applicationId: application._id.toString(),
      });
    }

    res.status(201).json({
      jobId,
      jobTitle: job.title,
      candidatesCreated: savedCandidates.length,
      applicationsCreated,
      message: `JSON candidates uploaded successfully for ${job.title}`,
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Invalid JSON or upload failed', error: error.message });
  }
};

export const uploadCsv = async (req: Request, res: Response) => {
  try {
    const jobId = (req.body?.jobId || req.query?.jobId) as string | undefined;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const records = parseCsv(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const candidates = records.map((record: Record<string, string>) => {
      const skills = record.skills
        ? record.skills.split('|').map((name) => ({ name: name.trim(), level: 'Intermediate', yearsOfExperience: 0 }))
        : [];

      return candidateCreateSchema.parse({
        source: 'csv',
        sourceFileName: req.file?.originalname,
        personalInfo: {
          firstName: record.firstName || record.first_name || '',
          lastName: record.lastName || record.last_name || '',
          email: record.email || '',
          headline: record.headline || record.role || 'Candidate',
          bio: record.bio || '',
          location: record.location || 'Unknown',
        },
        skills,
        languages: [],
        experience: [],
        education: [],
        certifications: [],
        projects: [],
        availability: {
          status: record.availabilityStatus || 'unknown',
          type: record.availabilityType || 'unknown',
          startDate: record.startDate || undefined,
        },
        socialLinks: {
          linkedin: record.linkedin || undefined,
          github: record.github || undefined,
          portfolio: record.portfolio || undefined,
        },
      });
    });
    const applicationsCreated: any[] = [];
    const savedCandidates: any[] = [];

    for (const candidatePayload of candidates) {
      const savedCandidate = await Candidate.findOneAndUpdate(
        { 'personalInfo.email': candidatePayload.personalInfo.email },
        { $set: candidatePayload },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      if (!savedCandidate) {
        throw new Error('Failed to save candidate');
      }
      savedCandidates.push(savedCandidate);

      const application = await Application.findOneAndUpdate(
        { jobId, candidateId: savedCandidate._id },
        {
          $set: {
            jobId,
            candidateId: savedCandidate._id,
            cvUrl: savedCandidate.resumeUrl || req.file.originalname,
            cvText: savedCandidate.resumeText || JSON.stringify(candidatePayload),
            sourceFileName: req.file.originalname,
            status: 'submitted',
          },
          $setOnInsert: { appliedAt: new Date() },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      if (!application) {
        throw new Error('Failed to save application');
      }
      applicationsCreated.push({
        candidateId: savedCandidate._id.toString(),
        applicationId: application._id.toString(),
      });
    }

    res.status(201).json({
      jobId,
      jobTitle: job.title,
      candidatesCreated: savedCandidates.length,
      applicationsCreated,
      message: `CSV candidates uploaded successfully for ${job.title}`,
    });
  } catch (error: any) {
    res.status(400).json({ message: 'CSV upload failed', error: error.message });
  }
};

// Upload Resume PDF → Cloudinary + Gemini Parse
export const uploadPdf = async (req: Request, res: Response) => {
  try {
    const jobId = (req.body?.jobId || req.query?.jobId) as string | undefined;
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }
    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

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

    const parsedText = await pdfParse(req.file.buffer);
    const parsedData = await parseResumeWithGemini(
      req.file.buffer,
      req.file.mimetype || 'application/pdf',
      parsedText.text || undefined,
    );
    const normalizedCandidate = candidateCreateSchema.parse({
      ...parsedData,
      source: 'pdf',
      sourceFileName: req.file.originalname,
      resumeText: parsedText.text || '',
    });

    // 3. Save candidate with resume URL
    const candidate = await Candidate.findOneAndUpdate(
      { 'personalInfo.email': normalizedCandidate.personalInfo.email },
      {
        $set: {
          ...normalizedCandidate,
          source: 'pdf',
          sourceFileName: req.file.originalname,
          resumeUrl: uploadResult.secure_url,
          resumeText: parsedText.text || '',
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    if (!candidate) {
      throw new Error('Failed to save candidate');
    }

    const application = await Application.findOneAndUpdate(
      { jobId, candidateId: candidate._id },
      {
        $set: {
          jobId,
          candidateId: candidate._id,
          cvUrl: uploadResult.secure_url,
          cvText: parsedText.text || '',
          sourceFileName: req.file.originalname,
          status: 'submitted',
        },
        $setOnInsert: { appliedAt: new Date() },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    if (!application) {
      throw new Error('Failed to save application');
    }

    res.status(201).json({
      jobId,
      jobTitle: job.title,
      message: `Resume PDF uploaded to Cloudinary and parsed successfully for ${job.title}`,
      candidateId: candidate._id,
      applicationId: application._id,
      resumeUrl: uploadResult.secure_url,
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

// Bulk Upload Resume PDFs → Cloudinary + Gemini Parse
export const uploadBulkPdf = async (req: Request, res: Response) => {
  try {
    const jobId = (req.body?.jobId || req.query?.jobId) as string | undefined;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No PDF files uploaded' });
    }
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        // 1. Upload PDF to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'umurava-resumes',
              public_id: `resume-${Date.now()}-${Math.random().toString(36).substring(7)}`
            },
            (error, result) => error ? reject(error) : resolve(result)
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        // 2. Parse with pdf-parse then Gemini
        const parsedText = await pdfParse(file.buffer);
        const parsedData = await parseResumeWithGemini(
          file.buffer,
          file.mimetype || 'application/pdf',
          parsedText.text || undefined,
        );

        const normalizedCandidate = candidateCreateSchema.parse({
          ...parsedData,
          source: 'pdf',
          sourceFileName: file.originalname,
          resumeText: parsedText.text || '',
        });

        // 3. Save candidate
        const candidate = await Candidate.findOneAndUpdate(
          { 'personalInfo.email': normalizedCandidate.personalInfo.email },
          {
            $set: {
              ...normalizedCandidate,
              resumeUrl: uploadResult.secure_url,
              resumeText: parsedText.text || '',
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        if (!candidate) {
          throw new Error('Failed to save candidate');
        }

        const application = await Application.findOneAndUpdate(
          { jobId, candidateId: candidate._id },
          {
            $set: {
              jobId,
              candidateId: candidate._id,
              cvUrl: uploadResult.secure_url,
              cvText: parsedText.text || '',
              sourceFileName: file.originalname,
              status: 'submitted',
            },
            $setOnInsert: { appliedAt: new Date() },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        if (!application) {
          throw new Error('Failed to save application');
        }

        results.push({
          candidateId: candidate._id,
          applicationId: application._id,
          fileName: file.originalname,
          resumeUrl: uploadResult.secure_url
        });
      } catch (err: any) {
        errors.push({
          fileName: file.originalname,
          error: err.message
        });
      }
    }

    res.status(201).json({
      jobId,
      jobTitle: job.title,
      message: `Processed ${files.length} files for ${job.title}`,
      count: results.length,
      candidates: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Bulk PDF upload error:', error);
    res.status(500).json({ message: 'Bulk PDF processing failed', error: error.message });
  }
};

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
