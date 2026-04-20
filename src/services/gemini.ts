import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Safe environment variables with fallbacks
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in .env file');
  process.exit(1); // Fail fast during development
}

const client = new GoogleGenAI({ 
  apiKey: GEMINI_API_KEY 
});

export const parseResumeWithGemini = async (buffer: Buffer, mimeType: string = 'application/pdf') => {
  try {
    const prompt = `Extract a complete structured candidate profile from this resume.
Return ONLY valid JSON that exactly matches the Umurava Candidate schema.
Do not add any extra text, markdown, or explanations.`;

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { 
              inlineData: { 
                data: buffer.toString('base64'), 
                mimeType 
              } 
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response text from Gemini');

    return JSON.parse(text);
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

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response text from Gemini');

    return JSON.parse(text);
  } catch (error: any) {
    console.error('Gemini screening error:', error.message);
    throw new Error(`Screening failed: ${error.message}`);
  }
};