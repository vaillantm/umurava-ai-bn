import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';
const resolveModel = () => process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractJson = (value: string) => {
  const trimmed = value.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? trimmed;
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first >= 0 && last > first) return candidate.slice(first, last + 1);
  return candidate;
};

const safeParseJson = (value: string) => {
  try {
    return JSON.parse(extractJson(value));
  } catch (e) {
    console.error('Failed to parse JSON from Gemini:', value);
    throw e;
  }
};

async function generateWithRetry(
  modelName: string,
  contents: { role: string; parts: { text?: string; inlineData?: { data: string; mimeType: string } }[] }[],
  retries = 3,
  delay = 2000
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents,
        config: { responseMimeType: 'application/json' },
      });
      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (error: any) {
      const isRateLimit = error.message?.includes('429') || error.status === 429;
      if (isRateLimit && i < retries - 1) {
        console.warn(`Gemini rate limit hit, retrying in ${delay}ms... (${i + 1}/${retries})`);
        await sleep(delay);
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to generate content after retries');
}

export const parseResumeWithGemini = async (
  buffer: Buffer,
  mimeType: string = 'application/pdf',
  extractedText?: string
) => {
  try {
    const prompt = `Extract a complete structured candidate profile from this resume.
Return ONLY valid JSON that exactly matches the Umurava Candidate schema.
Do not add any extra text, markdown, or explanations.`;

    const parts: { text?: string; inlineData?: { data: string; mimeType: string } }[] = [{ text: prompt }];

    if (extractedText?.trim()) {
      parts.push({ text: `Extracted text from the document:\n${extractedText}` });
    } else {
      parts.push({ inlineData: { data: buffer.toString('base64'), mimeType } });
    }

    const text = await generateWithRetry(resolveModel(), [{ role: 'user', parts }]);
    return safeParseJson(text);
  } catch (error: any) {
    console.error('Gemini PDF parsing error:', error.message);
    throw new Error(`Failed to parse resume with Gemini: ${error.message}`);
  }
};

export const runScreeningWithGemini = async (job: any, candidates: any[]) => {
  try {
    const prompt = `You are an expert technical recruiter working for Umurava.

Job: ${JSON.stringify(job)}

Candidates: ${JSON.stringify(candidates)}

Score and rank the candidates against the job requirements and aiWeights.
Return ONLY a valid JSON object with this exact structure. No markdown, no extra text:

{
  "summary": "Short recruiter-friendly summary of the shortlist",
  "results": [
    {
      "candidateId": "string",
      "rank": number,
      "score": number,
      "scoreBreakdown": {
        "skills": number,
        "experience": number,
        "education": number,
        "projects": number,
        "certifications": number
      },
      "strengths": ["string", "string"],
      "gaps": ["string", "string"],
      "reasoning": "Clear, neutral, recruiter-friendly explanation"
    }
  ],
  "incompleteCandidates": [
    { "candidateId": "string", "reason": "string" }
  ]
}`;

    const text = await generateWithRetry(resolveModel(), [{ role: 'user', parts: [{ text: prompt }] }]);
    return safeParseJson(text);
  } catch (error: any) {
    console.error('Gemini screening error:', error.message);
    throw new Error(`Screening failed: ${error.message}`);
  }
};

export const getGeminiModelName = () => resolveModel();

export const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

export const isIncompleteCandidate = (candidate: any): boolean => {
  if (!candidate?.personalInfo) return true;
  const { firstName, lastName, email, headline, location } = candidate.personalInfo;
  return !firstName || !lastName || !email || !headline || !location;
};
