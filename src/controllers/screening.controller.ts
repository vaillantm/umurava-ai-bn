import { Request, Response } from 'express';
import { Job } from '../models/job.model.js';
import { Candidate } from '../models/Candidate.model.js';
import { Screening } from '../models/Screening.model.js';
import { runScreeningWithGemini } from '../services/gemini.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

// Simple deterministic fallback scoring (used when Gemini fails)
const calculateFallbackScore = (job: any, candidate: any): number => {
  let score = 0;
  const weights = job.aiWeights || { skills: 40, experience: 30, education: 15, projects: 10, certifications: 5 };

  // Skills match (40%)
  const requiredSkills = job.requiredSkills || [];
  const candidateSkills = candidate.skills?.map((s: any) => s.name.toLowerCase()) || [];
  const skillMatches = requiredSkills.filter((skill: string) =>
    candidateSkills.some((cs: string) => cs.includes(skill.toLowerCase()))
  ).length;
  score += (skillMatches / Math.max(requiredSkills.length, 1)) * weights.skills;

  // Experience (30%)
  const totalExp = candidate.experience?.reduce((sum: number, exp: any) => {
    return sum + (exp.yearsOfExperience || 0);
  }, 0) || 0;
  score += Math.min(totalExp * 3, 30); // rough heuristic

  // Education (15%)
  const hasRelevantEducation = candidate.education?.some((edu: any) =>
    edu.fieldOfStudy?.toLowerCase().includes('computer') || 
    edu.degree?.toLowerCase().includes('bachelor')
  );
  score += hasRelevantEducation ? weights.education : 5;

  // Projects & Certifications (15%)
  score += (candidate.projects?.length || 0) * 2;
  score += (candidate.certifications?.length || 0) * 1.5;

  return Math.min(Math.max(Math.round(score), 40), 95); // keep between 40-95
};

export const runScreening = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, candidateIds, shortlistSize = 20 } = req.body;

    if (!jobId || !candidateIds || !Array.isArray(candidateIds)) {
      return res.status(400).json({ message: 'jobId and candidateIds array are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const candidates = await Candidate.find({ _id: { $in: candidateIds } });

    if (candidates.length === 0) {
      return res.status(400).json({ message: 'No candidates found for screening' });
    }

    let geminiResult: any = null;
    let usedFallback = false;

    try {
      // Primary: Try Gemini (structured output)
      geminiResult = await runScreeningWithGemini(job, candidates);
    } catch (geminiError: any) {
      console.warn('Gemini failed, falling back to deterministic scoring:', geminiError.message);
      usedFallback = true;

      // Fallback: Calculate deterministic scores + simple ranking
      const scoredCandidates = candidates.map((candidate: any, index: number) => {
        const score = calculateFallbackScore(job, candidate);
        return {
          candidateId: candidate._id,
          rank: index + 1,
          score: score,
          scoreBreakdown: {
            skills: Math.round(score * 0.4),
            experience: Math.round(score * 0.3),
            education: Math.round(score * 0.15),
            projects: Math.round(score * 0.1),
            certifications: Math.round(score * 0.05),
          },
          strengths: ["Strong technical background", "Relevant experience"],
          gaps: candidate.experience?.length < 2 ? ["Limited work history"] : [],
          reasoning: `Fallback score based on skill overlap and experience years. Score: ${score}`,
          decision: score >= 70 ? 'shortlisted' : 'review'
        };
      });

      // Sort by score descending
      scoredCandidates.sort((a, b) => b.score - a.score);

      geminiResult = {
        summary: "Screening completed using deterministic fallback due to AI service issue.",
        results: scoredCandidates.slice(0, shortlistSize),
        incompleteCandidates: []
      };
    }

    // Save screening record for audit
    const screeningRecord = await Screening.create({
      jobId,
      results: geminiResult.results.map((r: any) => ({
        ...r,
        candidateId: r.candidateId
      })),
      incompleteCandidates: geminiResult.incompleteCandidates || [],
      summary: geminiResult.summary || "AI-powered candidate screening completed.",
      totalCandidates: candidates.length,
      shortlistedCount: geminiResult.results.length,
      averageScore: geminiResult.results.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / geminiResult.results.length || 0,
      generatedBy: usedFallback ? 'deterministic-fallback' : (process.env.GEMINI_MODEL || 'gemini-2.5-pro')
    });

    // Return response for frontend
    res.json({
      jobId,
      totalCandidates: candidates.length,
      shortlistedCount: geminiResult.results.length,
      averageScore: screeningRecord.averageScore,
      usedFallback,
      ...geminiResult
    });

  } catch (error: any) {
    console.error('Screening controller error:', error);
    res.status(500).json({
      message: 'Failed to run screening. Please try again.',
      error: error.message
    });
  }
};

export const getLatestScreening = async (req: AuthRequest, res: Response) => {
  try {
    const screening = await Screening.findOne({ jobId: req.params.jobId })
      .sort({ createdAt: -1 })
      .populate('results.candidateId', 'personalInfo avatar');

    if (!screening) return res.status(404).json({ message: 'No screening found for this job' });

    res.json(screening);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getScreeningById = async (req: AuthRequest, res: Response) => {
  try {
    const screening = await Screening.findById(req.params.screeningId)
      .populate('results.candidateId', 'personalInfo avatar skills experience');

    if (!screening) return res.status(404).json({ message: 'Screening not found' });

    res.json(screening);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportScreening = async (req: AuthRequest, res: Response) => {
  try {
    const screening = await Screening.findById(req.params.screeningId)
      .populate('results.candidateId', 'personalInfo');

    if (!screening) return res.status(404).json({ message: 'Screening not found' });

    // Simple JSON export (you can enhance with CSV later)
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=shortlist-${req.params.screeningId}.json`);
    res.json({
      jobId: screening.jobId,
      summary: screening.summary,
      shortlisted: screening.results,
      incomplete: screening.incompleteCandidates,
      generatedAt: screening.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};