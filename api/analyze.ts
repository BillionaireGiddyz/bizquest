import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import googleTrends from 'google-trends-api';

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
  if (origin.endsWith('.vercel.app')) return origin;
  return ALLOWED_ORIGINS[0] || '*';
}

// ── Google Trends ──────────────────────────────────────────────────
interface TrendPoint { date: string; value: number }
interface TrendsResult {
  available: boolean;
  timeline: TrendPoint[];
  averageInterest: number;
  trendDirection: 'rising' | 'stable' | 'declining';
  relatedQueries: string[];
}

async function fetchGoogleTrends(keyword: string): Promise<TrendsResult> {
  const empty: TrendsResult = {
    available: false, timeline: [], averageInterest: 0,
    trendDirection: 'stable', relatedQueries: [],
  };
  try {
    const iotRaw = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      geo: 'KE',
      category: 0,
    });
    const iotData = JSON.parse(iotRaw);
    const timeline: TrendPoint[] = (iotData.default?.timelineData || []).map(
      (pt: { formattedTime: string; value: number[] }) => ({
        date: pt.formattedTime,
        value: pt.value[0] ?? 0,
      })
    );
    if (timeline.length === 0) return empty;

    const values = timeline.map(t => t.value);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const recentSlice = values.slice(-Math.min(12, Math.floor(values.length / 3)));
    const oldSlice = values.slice(0, Math.min(12, Math.floor(values.length / 3)));
    const recentAvg = recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length;
    const oldAvg = oldSlice.reduce((a, b) => a + b, 0) / Math.max(oldSlice.length, 1);
    const direction: TrendsResult['trendDirection'] =
      recentAvg > oldAvg * 1.15 ? 'rising' : recentAvg < oldAvg * 0.85 ? 'declining' : 'stable';

    let relatedQueries: string[] = [];
    try {
      const rqRaw = await googleTrends.relatedQueries({ keyword, geo: 'KE' });
      const rqData = JSON.parse(rqRaw);
      const topList = rqData.default?.rankedList?.[0]?.rankedKeyword || [];
      relatedQueries = topList.slice(0, 5).map((q: { query: string }) => q.query);
    } catch { /* non-critical */ }

    return {
      available: true,
      timeline: timeline.slice(-6),
      averageInterest: avg,
      trendDirection: direction,
      relatedQueries,
    };
  } catch (err) {
    console.error('Google Trends error:', err);
    return empty;
  }
}

// ── Google Places (Nearby competitor count) ────────────────────────
interface CompetitorResult {
  available: boolean;
  count: number;
  nearbyNames: string[];
  searchRadius: string;
}

async function fetchNearbyCompetitors(product: string, location: string): Promise<CompetitorResult> {
  const empty: CompetitorResult = { available: false, count: 0, nearbyNames: [], searchRadius: '' };
  const placesKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!placesKey || location.toLowerCase() === 'general') return empty;

  try {
    // Geocode location
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location + ', Kenya')}&key=${placesKey}`;
    const geoRes = await fetch(geoUrl);
    const geoData = (await geoRes.json()) as {
      results: Array<{ geometry: { location: { lat: number; lng: number } } }>;
    };
    if (!geoData.results?.[0]) return empty;
    const { lat, lng } = geoData.results[0].geometry.location;

    // Nearby search
    const radius = 3000;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(product)}&key=${placesKey}`;
    const searchRes = await fetch(url);
    const searchData = (await searchRes.json()) as {
      results: Array<{ name: string }>;
    };
    const places = searchData.results || [];

    return {
      available: true,
      count: places.length,
      nearbyNames: places.slice(0, 8).map(p => p.name),
      searchRadius: '3km',
    };
  } catch (err) {
    console.error('Google Places error:', err);
    return empty;
  }
}

// ── Gemini Schema ──────────────────────────────────────────────────
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, description: "The name of the product extracted from the query" },
    location: { type: Type.STRING, description: "The location extracted from the query. Use 'General' if not specified." },
    priceRange: { type: Type.STRING, description: "The price or price range extracted. Use 'Market Rate' if not specified." },
    demandScore: { type: Type.NUMBER, description: "Estimated demand score from 0 to 100. MUST be heavily influenced by the Google Trends average interest provided." },
    saturationLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    competitionLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "If competitor count data is provided, use it: 0-5=Low, 6-15=Medium, 16+=High." },
    timingStatus: { type: Type.STRING, enum: ["Early", "On-time", "Late"], description: "Use the Google Trends direction: rising=Early, stable=On-time, declining=Late." },
    recommendation: { type: Type.STRING, enum: ["GO", "BE CAREFUL", "AVOID"] },
    explanation: {
      type: Type.STRING,
      description: "A 3-5 sentence expert explanation. Reference the REAL data provided (Google Trends numbers, competitor counts). Cite specific numbers."
    },
    chatResponse: {
      type: Type.STRING,
      description: "A conversational, markdown-formatted summary. MUST reference real data when available (e.g. 'Google Trends shows X% average interest'). Include demand level, saturation, competition, timing, verdict with emoji, and a brief explanation. Use **bold** for emphasis and line breaks for readability."
    },
    trendData: {
      type: Type.ARRAY,
      description: "6 data points for the trend chart. If Google Trends data is provided, use those REAL values. Otherwise estimate.",
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
      description: "3-4 short, actionable bullet-point insights. Reference real data when available.",
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
    },
    dataSources: {
      type: Type.ARRAY,
      description: "List of real data sources used. Copy exactly from the provided data context.",
      items: { type: Type.STRING }
    },
    competitorCount: {
      type: Type.NUMBER,
      description: "Number of nearby competitors found. Use the Google Places count if provided, otherwise estimate."
    },
    nearbyCompetitors: {
      type: Type.ARRAY,
      description: "Names of nearby competing businesses. Use Google Places data if provided.",
      items: { type: Type.STRING }
    },
    googleTrendsAvg: {
      type: Type.NUMBER,
      description: "Average Google Trends interest score (0-100). Copy from the provided data."
    },
    trendDirection: {
      type: Type.STRING,
      enum: ["rising", "stable", "declining"],
      description: "Copy the trend direction from Google Trends data if available."
    },
    relatedSearches: {
      type: Type.ARRAY,
      description: "Related search queries from Google Trends. Copy from provided data.",
      items: { type: Type.STRING }
    }
  },
  required: [
    "productName", "location", "priceRange", "demandScore", "saturationLevel",
    "competitionLevel", "timingStatus", "recommendation", "explanation",
    "chatResponse", "trendData", "keyInsights", "targetDemographic", "bestSellingChannels",
    "dataSources", "competitorCount", "googleTrendsAvg", "trendDirection", "relatedSearches"
  ],
};

// ── Handler ────────────────────────────────────────────────────────
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
    // Step 1: Extract product + location from query using a quick Gemini call
    const extractRes = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `Extract the product/business name and location from this query. Return JSON: {"product": "...", "location": "..."}\nIf no location, use "General".\nQuery: "${query.slice(0, 300)}"`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: { type: Type.STRING },
            location: { type: Type.STRING },
          },
          required: ["product", "location"],
        },
      },
    });

    const extracted = JSON.parse(extractRes.text || '{}') as { product: string; location: string };
    const product = extracted.product || query.slice(0, 50);
    const location = extracted.location || 'General';

    // Step 2: Fetch real market data in parallel
    const [trends, competitors] = await Promise.all([
      fetchGoogleTrends(product),
      fetchNearbyCompetitors(product, location),
    ]);

    // Build real data context block for Gemini
    const dataSources: string[] = [];
    let realDataContext = '';

    if (trends.available) {
      dataSources.push('Google Trends');
      realDataContext += `\n\n📊 REAL GOOGLE TRENDS DATA (Kenya, last 12 months):
- Average search interest: ${trends.averageInterest}/100
- Trend direction: ${trends.trendDirection}
- Recent data points: ${trends.timeline.map(t => `${t.date}: ${t.value}`).join(', ')}
- Related searches: ${trends.relatedQueries.length > 0 ? trends.relatedQueries.join(', ') : 'none found'}
IMPORTANT: Use these REAL numbers for the trendData chart and demand score. Do NOT invent different numbers.`;
    }

    if (competitors.available) {
      dataSources.push('Google Places');
      realDataContext += `\n\n📍 REAL GOOGLE PLACES DATA (${competitors.searchRadius} radius around ${location}):
- Competing businesses found: ${competitors.count}
- Business names: ${competitors.nearbyNames.length > 0 ? competitors.nearbyNames.join(', ') : 'none found'}
IMPORTANT: Use this REAL competitor count for competitionLevel. Mention specific competitor names in your analysis.`;
    }

    if (dataSources.length === 0) {
      realDataContext = '\n\nNo external data sources were available for this query. Use your best market knowledge for estimates.';
    }

    // Step 3: Full analysis with real data context
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `You are an expert market analyst specializing in East African markets, particularly Kenya.
Analyze the following business question and provide a detailed, realistic market analysis.

CRITICAL INSTRUCTIONS:
- You have been provided REAL market data below. You MUST use this real data in your analysis.
- The trendData array MUST use the real Google Trends values when available — do not make up numbers.
- The competitorCount MUST match the Google Places count when available.
- Reference the real data in your chatResponse and explanation (e.g., "According to Google Trends..." or "Google Places found X competitors within 3km...").
- The dataSources array MUST list: ${JSON.stringify(dataSources)}

Consider:
- Kenyan consumer behaviour and purchasing power (urban vs rural markets)
- Local competition landscape (Nairobi CBDs, estates, towns like Thika, Nakuru, Kisumu, Mombasa)
- M-Pesa economy and mobile-first buying patterns
- Seasonal trends relevant to Kenya (school terms, harvest seasons, holidays like Christmas, Easter)
- Real demand signals for this product category in this region
- Price sensitivity for the given price range vs local income levels
- Demographics of specific Nairobi estates (Karen=affluent, Kibera=low income, Westlands=young professionals, etc.)
${realDataContext}

For the chatResponse field, format it nicely with markdown:
- Use **bold** for key metrics
- Use line breaks between sections
- Include relevant emoji for visual appeal
- Start with the product name and location
- Include a clear verdict
- ALWAYS mention which data sources were used (e.g., "📊 Based on Google Trends data..." or "📍 Google Places found X competitors...")

Be specific and realistic. Give a concrete, actionable analysis grounded in real data.

User Question: "${query.slice(0, 500)}"

Respond with valid JSON matching the schema.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a senior business consultant specializing in East African consumer markets. Always return valid JSON matching the schema. Be data-driven — when provided with real Google Trends or Google Places data, use those exact numbers. Never contradict the real data provided.",
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const parsed = JSON.parse(resultText);
    // Ensure dataSources is always accurate
    parsed.dataSources = dataSources;
    return res.status(200).json(parsed);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Gemini analysis failed:", message);
    const isQuota = message.includes('429') || message.toLowerCase().includes('quota');
    const isOverloaded = message.includes('503') || message.toLowerCase().includes('overloaded');
    const clientMessage = isQuota
      ? 'AI service quota exceeded. Please try again later.'
      : isOverloaded
      ? 'AI service is temporarily busy. Please try again in a moment.'
      : 'Analysis failed. Please try again.';
    return res.status(500).json({ error: clientMessage });
  }
}
