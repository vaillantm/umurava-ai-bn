import { Request, Response } from 'express';
import { Job } from '../models/job.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.create({ ...req.body, createdBy: req.user?.id });
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ createdBy: req.user?.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user?.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user?.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const updateData: Record<string, unknown> = { ...req.body };

    if (req.body.aiWeights) {
      updateData.aiWeights = {
        ...(job.aiWeights || {}),
        ...req.body.aiWeights,
      };
    }

    job.set(updateData);
    await job.save();

    res.json(job);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.jobId, createdBy: req.user?.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
