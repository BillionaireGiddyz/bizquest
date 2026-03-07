import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin.endsWith('.vercel.app') ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

USER FOLLOW-UP QUESTION: "${question.slice(0, 300)}"

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
    const message = error instanceof Error ? error.message : String(error);
    console.error("Follow-up failed:", message);
    return res.status(500).json({ error: 'Follow-up failed. Please try again.' });
  }
}
