import { Response } from 'express';
import { Job } from '../models/job.model.js';
import { Candidate } from '../models/Candidate.model.js';
import { Application } from '../models/Application.model.js';
import { Screening } from '../models/Screening.model.js';
import { isIncompleteCandidate, parseResumeWithGemini } from '../services/gemini.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import pdfParse from 'pdf-parse';
import { candidateCreateSchema } from '../utils/validators.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

type AppStatus = 'shortlisted' | 'submitted' | 'screened' | 'manual_review';

const calculateFallbackScore = (job: any, candidate: any): number => {
  let score = 0;
  const weights = job.aiWeights || { skills: 40, experience: 30, education: 15, projects: 10, certifications: 5 };
  const requiredSkills = job.requiredSkills || [];
  const candidateSkills = candidate.skills?.map((s: any) => s.name.toLowerCase()) || [];
  const skillMatches = requiredSkills.filter((skill: string) =>
    candidateSkills.some((cs: string) => cs.includes(skill.toLowerCase()))
  ).length;
  score += (skillMatches / Math.max(requiredSkills.length, 1)) * weights.skills;
  const totalExp = candidate.experience?.reduce((sum: number, exp: any) => sum + (exp.yearsOfExperience || 0), 0) || 0;
  score += Math.min(totalExp * 3, 30);
  const hasRelevantEducation = candidate.education?.some((edu: any) =>
    edu.fieldOfStudy?.toLowerCase().includes('computer') || edu.degree?.toLowerCase().includes('bachelor')
  );
  score += hasRelevantEducation ? weights.education : 5;
  score += (candidate.projects?.length || 0) * 2;
  score += (candidate.certifications?.length || 0) * 1.5;
  return Math.min(Math.max(Math.round(score), 40), 95);
};

const normalizeResult = (candidate: any, result: any, rankOffset: number) => ({
  candidateId: candidate._id,
  rank: result.rank || rankOffset,
  score: Number(result.score || 0),
  scoreBreakdown: result.scoreBreakdown || { skills: 0, experience: 0, education: 0, projects: 0, certifications: 0 },
  strengths: Array.isArray(result.strengths) ? result.strengths : [],
  gaps: Array.isArray(result.gaps) ? result.gaps : [],
  reasoning: result.reasoning || 'No reasoning returned by AI.',
  decision: result.decision || result.verdict || 'review',
  workflowStatus: result.workflowStatus,
  shortlistLabel: result.shortlistLabel,
});

const fallbackScreening = (job: any, candidates: any[], shortlistSize: number) => {
  const scoredCandidates = candidates.map((candidate: any, index: number) => {
    const score = calculateFallbackScore(job, candidate);
    return {
      candidateId: candidate._id,
      rank: index + 1,
      score,
      scoreBreakdown: {
        skills: Math.round(score * 0.4),
        experience: Math.round(score * 0.3),
        education: Math.round(score * 0.15),
        projects: Math.round(score * 0.1),
        certifications: Math.round(score * 0.05),
      },
      strengths: ['Strong technical background', 'Relevant experience'],
      gaps: candidate.experience?.length < 2 ? ['Limited work history'] : [],
      reasoning: `Fallback score based on skill overlap and experience years. Score: ${score}`,
      decision: score >= 70 ? 'shortlisted' : 'review',
    };
  });
  scoredCandidates.sort((a, b) => b.score - a.score);
  const shortlisted = scoredCandidates.filter((item) => item.decision === 'shortlisted').slice(0, shortlistSize);
  const incompleteCandidates = candidates
    .filter((candidate) => isIncompleteCandidate(candidate))
    .map((candidate) => ({ candidateId: candidate._id, reason: 'Missing required personal information or resume fields.' }));
  return { summary: 'Screening completed using deterministic fallback due to AI service issue.', results: shortlisted, incompleteCandidates };
};

async function scoreWithGemini(cvText: string, jobTitle: string): Promise<{ score: number; verdict: string; reasoning?: string; strengths?: string[]; gaps?: string[]; workflowStatus?: string; shortlistLabel?: string } | null> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set in environment variables.');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite' });
  const prompt = `Score this CV for the job: ${jobTitle}\n\nCV:\n${cvText}\n\nReturn only JSON:\n{\n  "score": 0-100,\n  "verdict": "shortlisted" or "rejected",\n  "reasoning": "explanation",\n  "strengths": [],\n  "gaps": [],\n  "workflowStatus": "",\n  "shortlistLabel": ""\n}`;
  const result = await model.generateContent(prompt);
  let jsonString = result.response.text().trim();
  if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  const parsed = JSON.parse(jsonString);
  return {
    score: Number(parsed.score) || 0,
    verdict: parsed.verdict || 'review',
    reasoning: parsed.reasoning || 'No reasoning provided.',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
    workflowStatus: parsed.workflowStatus,
    shortlistLabel: parsed.shortlistLabel,
  };
}

const processScreeningLogic = async (jobId: string, candidateIds: string[] = [], shortlistSize: number) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const applicationFilter = candidateIds.length ? { jobId, candidateId: { $in: candidateIds } } : { jobId };
  const applications = await Application.find(applicationFilter).lean();
  const applicationCandidateIds = applications.map((a) => `${a.candidateId}`);
  const candidateFilterIds = applicationCandidateIds.length ? applicationCandidateIds : candidateIds;
  const candidates = candidateFilterIds.length ? await Candidate.find({ _id: { $in: candidateFilterIds } }) : [];

  if (candidates.length === 0) throw new Error('No candidates found for screening');

  const candidateToApplication = new Map<string, any>(applications.map((a) => [`${a.candidateId}`, a]));
  const incompleteCandidates: Array<{ candidateId: string; reason: string }> = [];
  const processedResults: Array<{
    candidateId: string;
    applicationId?: string;
    score: number;
    decision: string;
    reasoning?: string;
    strengths?: string[];
    gaps?: string[];
    workflowStatus?: string;
    shortlistLabel?: string;
    scoreBreakdown?: Record<string, number>;
  }> = [];
  let usedFallback = false;
  const aiSummaries: string[] = [];

  for (const candidate of candidates) {
    const application = candidateToApplication.get(`${candidate._id}`);
    const cvText =
      application?.cvText ||
      candidate.resumeText ||
      [
        `Name: ${candidate.personalInfo?.firstName || ''} ${candidate.personalInfo?.lastName || ''}`.trim(),
        `Email: ${candidate.personalInfo?.email || ''}`,
        `Headline: ${candidate.personalInfo?.headline || ''}`,
        `Location: ${candidate.personalInfo?.location || ''}`,
        `Skills: ${(candidate.skills || []).map((s: any) => s.name).join(', ')}`,
        `Experience: ${(candidate.experience || []).map((e: any) => `${e.role} at ${e.company}`).join(' | ')}`,
      ].join('\n');

    if (isIncompleteCandidate(candidate)) {
      incompleteCandidates.push({
        candidateId: candidate._id.toString(),
        reason: application?.cvText ? 'Incomplete structured candidate profile.' : 'Missing required personal information or resume fields.',
      });
      continue;
    }

    try {
      const geminiResponse = await scoreWithGemini(cvText || '', job.title || 'Unknown Job');
      if (geminiResponse) {
        processedResults.push({
          ...normalizeResult(candidate, { score: geminiResponse.score, verdict: geminiResponse.verdict, reasoning: geminiResponse.reasoning, strengths: geminiResponse.strengths, gaps: geminiResponse.gaps, workflowStatus: geminiResponse.workflowStatus, shortlistLabel: geminiResponse.shortlistLabel }, 0),
          applicationId: application?._id?.toString(),
        });
        aiSummaries.push(`Candidate ${candidate._id}: AI scored.`);
      } else {
        usedFallback = true;
        const fb = fallbackScreening(job, [candidate], shortlistSize);
        processedResults.push(fb.results.length > 0 ? { ...fb.results[0], applicationId: application?._id?.toString() } : { candidateId: candidate._id.toString(), applicationId: application?._id?.toString(), score: 40, decision: 'review', reasoning: 'Fallback failed.' });
        if (fb.incompleteCandidates?.length > 0) incompleteCandidates.push(...fb.incompleteCandidates);
      }
    } catch {
      usedFallback = true;
      const fb = fallbackScreening(job, [candidate], shortlistSize);
      processedResults.push(fb.results.length > 0 ? { ...fb.results[0], applicationId: application?._id?.toString() } : { candidateId: candidate._id.toString(), applicationId: application?._id?.toString(), score: 40, decision: 'review', reasoning: 'Fallback failed.' });
      if (fb.incompleteCandidates?.length > 0) incompleteCandidates.push(...fb.incompleteCandidates);
    }
  }

  processedResults.sort((a, b) => b.score - a.score);
  const results = processedResults.filter((item) => item.decision === 'shortlisted').slice(0, shortlistSize).map((item, index) => ({ ...item, rank: index + 1 }));
  const geminiResult = { summary: aiSummaries.length ? aiSummaries.join(' ') : 'AI screening completed.', results, incompleteCandidates };
  const averageScore = geminiResult.results.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / geminiResult.results.length || 0;

  const screeningRecord = await Screening.create({
    jobId,
    results: geminiResult.results.map((r: any) => ({ candidateId: r.candidateId, rank: r.rank, score: r.score, scoreBreakdown: r.scoreBreakdown, strengths: r.strengths, gaps: r.gaps, reasoning: r.reasoning, decision: r.decision, workflowStatus: r.workflowStatus, shortlistLabel: r.shortlistLabel })),
    incompleteCandidates: geminiResult.incompleteCandidates,
    summary: geminiResult.summary || 'AI-powered candidate screening completed.',
    totalCandidates: candidates.length,
    shortlistedCount: geminiResult.results.length,
    averageScore,
    generatedBy: usedFallback ? 'deterministic-fallback' : (process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'),
  });

  const shortlistedApplicationUpdates = geminiResult.results.map((result: any) => ({
    updateOne: {
      filter: { jobId, candidateId: result.candidateId },
      update: {
        $set: {
          screeningId: screeningRecord._id,
          status: 'shortlisted' as AppStatus,
          score: result.score,
          decision: result.decision,
          reasoning: result.reasoning,
          workflowStatus: result.workflowStatus,
          shortlistLabel: result.shortlistLabel,
          screenedAt: new Date(),
        },
      },
    },
  }));

  const screenedApplicationUpdates = candidates
    .filter((candidate) => !geminiResult.results.some((result: any) => `${result.candidateId}` === `${candidate._id}`))
    .map((candidate) => ({
      updateOne: {
        filter: { jobId, candidateId: candidate._id },
        update: {
          $set: {
            screeningId: screeningRecord._id,
            status: (incompleteCandidates.some((item) => `${item.candidateId}` === `${candidate._id}`) ? 'manual_review' : 'screened') as AppStatus,
            screenedAt: new Date(),
          },
        },
      },
    }));

  if (shortlistedApplicationUpdates.length > 0) await Application.bulkWrite(shortlistedApplicationUpdates);
  if (screenedApplicationUpdates.length > 0) await Application.bulkWrite(screenedApplicationUpdates);

  await Job.findByIdAndUpdate(jobId, {
    $set: {
      shortlistedCandidates: geminiResult.results.map((result: any) => ({ candidateId: result.candidateId, applicationId: result.applicationId, score: result.score, rank: result.rank, decision: result.decision, reasoning: result.reasoning, shortlistedAt: new Date() })),
    },
  });

  return { jobId, jobTitle: job.title, totalCandidates: candidates.length, shortlistedCount: geminiResult.results.length, averageScore: screeningRecord.averageScore, usedFallback, screeningId: screeningRecord._id.toString(), ...geminiResult };
};

export const runScreening = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, candidateIds, shortlistSize = 20 } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ message: 'Invalid jobId format' });
    const candidateIdList = Array.isArray(candidateIds) ? candidateIds : [];
    const invalidIds = candidateIdList.filter((id: string) => !mongoose.isValidObjectId(id));
    if (invalidIds.length > 0) return res.status(400).json({ message: 'One or more candidateIds are invalid', invalidIds });
    const result = await processScreeningLogic(jobId, candidateIdList, shortlistSize);
    res.json(result);
  } catch (error: any) {
    res.status(error.message === 'Job not found' ? 404 : 500).json({ message: error.message || 'Failed to run screening.', error: error.message });
  }
};

export const runBulkScreening = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, shortlistSize = 20 } = req.body;
    const files = req.files as Express.Multer.File[];
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ message: 'Invalid jobId format' });
    if (!files || files.length === 0) return res.status(400).json({ message: 'No PDF files uploaded' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const createdCandidateIds: string[] = [];
    const results: any[] = [];
    const createdApplications: any[] = [];
    const uploadErrors: any[] = [];

    for (const file of files) {
      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: 'umurava-resumes', public_id: `resume-${Date.now()}-${Math.random().toString(36).substring(7)}` },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        const parsedText = await pdfParse(file.buffer);
        const parsedData = await parseResumeWithGemini(file.buffer, file.mimetype || 'application/pdf', parsedText.text || undefined);
        const normalizedCandidate = candidateCreateSchema.parse({ ...parsedData, source: 'pdf', sourceFileName: file.originalname });

        const candidate = await Candidate.findOneAndUpdate(
          { 'personalInfo.email': normalizedCandidate.personalInfo.email },
          { $set: { ...normalizedCandidate, resumeUrl: uploadResult.secure_url, resumeText: parsedText.text || '' }, $setOnInsert: { source: 'pdf', sourceFileName: file.originalname } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        if (!candidate) throw new Error('Failed to save candidate');

        const application = await Application.findOneAndUpdate(
          { jobId, candidateId: candidate._id },
          { $set: { jobId, candidateId: candidate._id, cvUrl: uploadResult.secure_url, cvText: parsedText.text || '', sourceFileName: file.originalname, status: 'submitted' as AppStatus }, $setOnInsert: { appliedAt: new Date() } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        if (!application) throw new Error('Failed to save application');

        createdCandidateIds.push(candidate._id.toString());
        results.push({ candidateId: candidate._id.toString(), applicationId: application._id.toString(), fileName: file.originalname, resumeUrl: uploadResult.secure_url });
        createdApplications.push(application);
      } catch (err: any) {
        uploadErrors.push({ fileName: file.originalname, error: err.message });
      }
    }

    if (createdCandidateIds.length === 0) return res.status(400).json({ message: 'Failed to process any resumes', errors: uploadErrors });

    const screeningResult = await processScreeningLogic(jobId, createdCandidateIds, shortlistSize);
    res.status(201).json({
      message: 'Bulk upload and screening completed',
      uploadCount: createdCandidateIds.length,
      applicationsCreated: results,
      applicationRecords: createdApplications.map((a) => ({ id: a._id.toString(), jobId: a.jobId.toString(), candidateId: a.candidateId.toString(), status: a.status, cvUrl: a.cvUrl })),
      uploadErrors: uploadErrors.length > 0 ? uploadErrors : undefined,
      ...screeningResult,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Bulk screening failed', error: error.message });
  }
};

export const getLatestScreening = async (req: AuthRequest, res: Response) => {
  try {
    const screening = await Screening.findOne({ jobId: req.params.jobId }).sort({ createdAt: -1 }).populate('results.candidateId', 'personalInfo avatar');
    if (!screening) return res.status(404).json({ message: 'No screening found for this job' });
    res.json(screening);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getScreeningById = async (req: AuthRequest, res: Response) => {
  try {
    const screening = await Screening.findById(req.params.screeningId).populate('results.candidateId', 'personalInfo avatar skills experience');
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    res.json(screening);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportScreening = async (req: AuthRequest, res: Response) => {
  try {
    const screening = await Screening.findById(req.params.screeningId).populate('results.candidateId', 'personalInfo');
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=shortlist-${req.params.screeningId}.json`);
    res.json({ jobId: screening.jobId, summary: screening.summary, shortlisted: screening.results, incomplete: screening.incompleteCandidates, generatedAt: screening.createdAt });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
