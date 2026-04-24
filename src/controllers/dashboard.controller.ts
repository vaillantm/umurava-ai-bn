import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Job } from '../models/job.model.js';
import { Candidate } from '../models/Candidate.model.js';
import { Screening } from '../models/Screening.model.js';

export const getDashboardSnapshot = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ createdBy: req.user?.id }).sort({ createdAt: -1 }).lean();
    const candidates = await Candidate.find().sort({ createdAt: -1 }).lean();
    const latestJobIds = jobs.map((job) => job._id);
    const latestScreening = latestJobIds.length
      ? await Screening.findOne({ jobId: { $in: latestJobIds } })
          .sort({ createdAt: -1 })
          .lean()
      : null;

    res.json({
      jobs,
      candidates,
      latestScreening,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
