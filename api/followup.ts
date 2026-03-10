import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 30; // 30 follow-ups per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  const APP_URL = process.env.PRODUCTION_URL || 'https://bizquest-eight.vercel.app';
  const allowedOrigin = origin.endsWith('.vercel.app') || origin.includes('localhost') ? origin : APP_URL;
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit by IP
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });
  }

  const { question, analysisContext } = req.body as {
    question: string;
    analysisContext: {
      productName: string;
      location: string;
      demandScore: number;
      competitionLevel: string;
      recommendation: string;
      explanation: string;
    };
  };

  if (!question || !analysisContext?.productName) {
    return res.status(400).json({ error: 'Question and analysis context are required' });
  }
  if (question.length > 500) {
    return res.status(400).json({ error: 'Question too long. Please keep it under 500 characters.' });
  }
  // Sanitize question input
  const sanitizedQuestion = question.trim().replace(/[^\p{L}\p{N}\s&\-,.()'?!:]/gu, '').slice(0, 300);
  if (sanitizedQuestion.length < 3) {
    return res.status(400).json({ error: 'Question too short.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'AI service not configured' });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `You are a BizQuest market consultant. The user already ran an analysis and now has a follow-up question.

PREVIOUS ANALYSIS CONTEXT:
- Product: ${analysisContext.productName}
- Location: ${analysisContext.location}
- Demand Score: ${analysisContext.demandScore}/100
- Competition: ${analysisContext.competitionLevel}
- Recommendation: ${analysisContext.recommendation}
- Summary: ${analysisContext.explanation}

USER FOLLOW-UP QUESTION: "${sanitizedQuestion}"

RULES:
- Give a concise, actionable answer (2-4 sentences max)
- Reference the original analysis data where relevant
- Use markdown for formatting (**bold** for key points)
- NEVER mention Google, Google Trends, or any third-party source
- Present insights as BizQuest's own intelligence
- Be direct and practical`
        }]
      }],
      config: {
        systemInstruction: "You are BizQuest Quantum — the world's most advanced AI business intelligence engine. You apply probabilistic market analysis (Bayesian inference, Cumulative Prospect Theory, Fuzzy Set Theory) to deliver shockingly precise answers. Give short, direct follow-up answers grounded in the original analysis data. Never exceed 4 sentences. Never mention Google or any third-party source. Present all insights as BizQuest's proprietary Quantum Market Intelligence™. Be specific — cite numbers, name competitors, give actionable next steps.",
      },
    });

    const text = response.text || 'Sorry, I could not generate a response.';
    return res.status(200).json({ response: text });

  } catch (error: unknown) {
    const ref = Math.random().toString(36).slice(2, 8);
    console.error(`Follow-up failed (ref:${ref}):`, error instanceof Error ? error.message : String(error));
    return res.status(500).json({ error: 'Follow-up failed. Please try again.' });
  }
}
