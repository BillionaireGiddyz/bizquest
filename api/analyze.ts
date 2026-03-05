import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.PRODUCTION_URL || '',
].filter(Boolean);

function getCorsOrigin(req: VercelRequest): string {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // Allow Vercel preview deployments
  if (origin.endsWith('.vercel.app')) return origin;
  return ALLOWED_ORIGINS[0] || '*';
}

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, description: "The name of the product extracted from the query" },
    location: { type: Type.STRING, description: "The location extracted from the query. Use 'General' if not specified." },
    priceRange: { type: Type.STRING, description: "The price or price range extracted. Use 'Market Rate' if not specified." },
    demandScore: { type: Type.NUMBER, description: "Estimated demand score from 0 to 100 based on market logic." },
    saturationLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    competitionLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    timingStatus: { type: Type.STRING, enum: ["Early", "On-time", "Late"] },
    recommendation: { type: Type.STRING, enum: ["GO", "BE CAREFUL", "AVOID"] },
    explanation: {
      type: Type.STRING,
      description: "A 3-5 sentence expert explanation referencing local Kenyan market dynamics, consumer behaviour, and competitive landscape."
    },
    chatResponse: {
      type: Type.STRING,
      description: "A conversational, markdown-formatted summary for the chat. Include demand level, saturation, competition, timing, verdict with emoji, and a brief explanation. Use **bold** for emphasis and line breaks for readability."
    },
    trendData: {
      type: Type.ARRAY,
      description: "6 data points representing interest level (0-100): 3 months past, current month, 2 months projected. Use short month names.",
      items: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING, description: "Short month name e.g. 'Jan'" },
          interestLevel: { type: Type.NUMBER, description: "Interest level 0-100" }
        },
        required: ["period", "interestLevel"]
      }
    },
    keyInsights: {
      type: Type.ARRAY,
      description: "3-4 short, actionable bullet-point insights specific to this product/location combo.",
      items: { type: Type.STRING }
    },
    targetDemographic: {
      type: Type.STRING,
      description: "Brief description of the ideal target customer for this product in this location."
    },
    bestSellingChannels: {
      type: Type.ARRAY,
      description: "Top 2-3 recommended sales channels (e.g. 'Physical storefront', 'Instagram/TikTok', 'Jiji', 'M-Pesa Till')",
      items: { type: Type.STRING }
    }
  },
  required: [
    "productName", "location", "priceRange", "demandScore", "saturationLevel",
    "competitionLevel", "timingStatus", "recommendation", "explanation",
    "chatResponse", "trendData", "keyInsights", "targetDemographic", "bestSellingChannels"
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body as { query: string };
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert market analyst specializing in East African markets, particularly Kenya.
Analyze the following business question and provide a detailed, realistic market analysis.

Consider:
- Kenyan consumer behaviour and purchasing power (urban vs rural markets)
- Local competition landscape (Nairobi CBDs, estates, towns like Thika, Nakuru, Kisumu, Mombasa)
- M-Pesa economy and mobile-first buying patterns
- Seasonal trends relevant to Kenya (school terms, harvest seasons, holidays like Christmas, Easter)
- Real demand signals for this product category in this region
- Price sensitivity for the given price range vs local income levels
- Demographics of specific Nairobi estates (Karen=affluent, Kibera=low income, Westlands=young professionals, etc.)

For the chatResponse field, format it nicely with markdown:
- Use **bold** for key metrics
- Use line breaks between sections
- Include relevant emoji for visual appeal
- Start with the product name and location
- Include a clear verdict

Be specific and realistic. Give a concrete, actionable analysis.

User Question: "${query.slice(0, 500)}"

Respond with valid JSON matching the schema.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a senior business consultant specializing in East African consumer markets. Always return valid JSON matching the schema. Be data-driven and specific to the Kenyan market context.",
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const parsed = JSON.parse(resultText);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}
