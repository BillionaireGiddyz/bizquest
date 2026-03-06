import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import googleTrends from 'google-trends-api';
import { createClient } from '@supabase/supabase-js';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

const CACHE_TTL_HOURS = 24;

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

async function fetchGoogleTrends(keyword: string, geo: string = ''): Promise<TrendsResult> {
  const empty: TrendsResult = {
    available: false, timeline: [], averageInterest: 0,
    trendDirection: 'stable', relatedQueries: [],
  };
  try {
    const iotRaw = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      geo: geo || '',
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
      const rqRaw = await googleTrends.relatedQueries({ keyword, geo: geo || '' });
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

async function fetchNearbyCompetitors(product: string, location: string, country: string = ''): Promise<CompetitorResult> {
  const empty: CompetitorResult = { available: false, count: 0, nearbyNames: [], searchRadius: '' };
  const placesKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!placesKey || location.toLowerCase() === 'general') return empty;

  try {
    // Geocode location — append country if known for better accuracy
    const addressQuery = country ? `${location}, ${country}` : location;
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&key=${placesKey}`;
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
    demandScore: { type: Type.NUMBER, description: "Estimated demand score from 0 to 100. MUST be heavily influenced by the market interest data provided." },
    saturationLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    competitionLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "If competitor count data is provided, use it: 0-5=Low, 6-15=Medium, 16+=High." },
    timingStatus: { type: Type.STRING, enum: ["Early", "On-time", "Late"], description: "Use the trend direction from market data: rising=Early, stable=On-time, declining=Late." },
    recommendation: { type: Type.STRING, enum: ["GO", "BE CAREFUL", "AVOID"] },
    explanation: {
      type: Type.STRING,
      description: "A 3-5 sentence expert explanation. Reference the real market data provided (interest numbers, competitor counts). Cite specific numbers but NEVER mention the source names like Google Trends or Google Places. Present the data as BizQuest's own proprietary analysis."
    },
    chatResponse: {
      type: Type.STRING,
      description: "A conversational, markdown-formatted summary. Reference real data numbers when available but NEVER mention Google Trends, Google Places, or any third-party source name. Present all insights as BizQuest's own market intelligence. Include demand level, saturation, competition, timing, verdict with emoji, and a brief explanation. Use **bold** for emphasis and line breaks for readability."
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
      description: "Top 2-3 recommended sales channels relevant to the detected country (e.g. Kenya: 'Jiji', 'M-Pesa Till'; SA: 'Takealot', 'Facebook Marketplace'; US: 'Amazon', 'Etsy', 'Shopify')",
      items: { type: Type.STRING }
    },
    dataSources: {
      type: Type.ARRAY,
      description: "List of real data sources used. Copy exactly from the provided data context.",
      items: { type: Type.STRING }
    },
    competitorCount: {
      type: Type.NUMBER,
      description: "Number of nearby competitors found. Use the provided market data count if available, otherwise estimate."
    },
    nearbyCompetitors: {
      type: Type.ARRAY,
      description: "Names of nearby competing businesses. Use provided market data if available.",
      items: { type: Type.STRING }
    },
    googleTrendsAvg: {
      type: Type.NUMBER,
      description: "Average market interest score (0-100). Copy from the provided data."
    },
    trendDirection: {
      type: Type.STRING,
      enum: ["rising", "stable", "declining"],
      description: "Copy the trend direction from provided data if available."
    },
    relatedSearches: {
      type: Type.ARRAY,
      description: "Related search queries people also look for. Copy from provided data.",
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

  // Normalize query for cache key
  const cacheKey = query.trim().toLowerCase().replace(/\s+/g, ' ');

  // Check cache first
  try {
    const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from('analysis_cache')
      .select('result')
      .eq('query_key', cacheKey)
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cached?.result) {
      return res.status(200).json(cached.result);
    }
  } catch {
    // Cache miss or table doesn't exist yet — continue with fresh analysis
  }

  try {
    // Step 1: Extract product, location, and country from query
    const extractRes = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `Extract the product/business name, location, country name, and ISO 3166-1 alpha-2 country code from this query.
If no location is mentioned, use "General" for location and "" for country/geoCode.
If a location is mentioned but no country, infer the most likely country.
Examples: "Nakuru" → country: "Kenya", geoCode: "KE". "Cape Town" → country: "South Africa", geoCode: "ZA". "Miami" → country: "United States", geoCode: "US".
Query: "${query.slice(0, 300)}"`
        }]
      }],
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: { type: Type.STRING },
            location: { type: Type.STRING },
            country: { type: Type.STRING, description: "Full country name, e.g. Kenya, South Africa, United States" },
            geoCode: { type: Type.STRING, description: "ISO 3166-1 alpha-2 code, e.g. KE, ZA, US. Empty string if unknown." },
          },
          required: ["product", "location", "country", "geoCode"],
        },
      },
    });

    const extracted = JSON.parse(extractRes.text || '{}') as { product: string; location: string; country: string; geoCode: string };
    const product = extracted.product || query.slice(0, 50);
    const location = extracted.location || 'General';
    const country = extracted.country || '';
    const geoCode = extracted.geoCode || '';

    // Step 2: Fetch real market data in parallel (scoped to detected country)
    const [trends, competitors] = await Promise.all([
      fetchGoogleTrends(product, geoCode),
      fetchNearbyCompetitors(product, location, country),
    ]);

    // Build real data context block for Gemini
    const dataSources: string[] = [];
    let realDataContext = '';

    if (trends.available) {
      dataSources.push('Market Trends');
      realDataContext += `\n\n📊 REAL MARKET SEARCH DATA (${country || 'Global'}, last 12 months):
- Average search interest: ${trends.averageInterest}/100
- Trend direction: ${trends.trendDirection}
- Recent data points: ${trends.timeline.map(t => `${t.date}: ${t.value}`).join(', ')}
- Related searches: ${trends.relatedQueries.length > 0 ? trends.relatedQueries.join(', ') : 'none found'}
IMPORTANT: Use these REAL numbers for the trendData chart and demand score. Do NOT invent different numbers.`;
    }

    if (competitors.available) {
      dataSources.push('Location Intelligence');
      realDataContext += `\n\n📍 REAL COMPETITOR DATA (${competitors.searchRadius} radius around ${location}):
- Competing businesses found: ${competitors.count}
- Business names: ${competitors.nearbyNames.length > 0 ? competitors.nearbyNames.join(', ') : 'none found'}
IMPORTANT: Use this REAL competitor count for competitionLevel. Mention specific competitor names in your analysis.`;
    }

    if (dataSources.length === 0) {
      realDataContext = '\n\nNo external data sources were available for this query. Use your best market knowledge for estimates.';
    }

    // Step 3: Full analysis with real data context
    const regionContext = country
      ? `The user is asking about a market in **${location}, ${country}**. Tailor your analysis to this specific country and region.`
      : `No specific country was detected. Provide a general global market perspective.`;

    const localKnowledge = country === 'Kenya'
      ? `- Kenyan consumer behaviour and purchasing power (urban vs rural markets)
- Local competition landscape (Nairobi CBDs, estates, towns like Thika, Nakuru, Kisumu, Mombasa)
- M-Pesa economy and mobile-first buying patterns
- Seasonal trends relevant to Kenya (school terms, harvest seasons, holidays like Christmas, Easter)
- Demographics of specific Nairobi estates (Karen=affluent, Kibera=low income, Westlands=young professionals, etc.)`
      : country === 'South Africa'
      ? `- South African consumer behaviour (townships vs suburbs, rising middle class)
- Local competition landscape (Johannesburg CBD, Cape Town waterfront, Durban beachfront, Soweto, Sandton)
- Mobile money and card payment adoption
- Seasonal trends (back-to-school Jan, Heritage Day Sep, Black Friday Nov, festive season Dec)
- Demographics (LSM levels, township economy vs suburban malls)
- Load shedding impact on business operations`
      : country === 'United States'
      ? `- American consumer behaviour and spending power by region
- E-commerce dominance (Amazon, Shopify, Etsy) vs physical retail
- Seasonal trends (back-to-school Aug, Black Friday Nov, holiday season Dec)
- Demographics by city/state (NYC=high cost, Miami=Latin market, LA=trend-forward, Midwest=value-driven)
- Digital marketing channels (Instagram, TikTok, Google Ads, Facebook Marketplace)`
      : `- Local consumer behaviour, purchasing power, and cultural preferences for ${country || 'this region'}
- Typical competition landscape and business environment
- Popular payment methods and shopping channels
- Seasonal trends and holidays that affect buying patterns
- Demographics and income levels in the specific area mentioned`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `You are an expert global market analyst working for BizQuest.
${regionContext}

Analyze the following business question and provide a detailed, realistic market analysis.

CRITICAL INSTRUCTIONS:
- You have been provided REAL market data below. You MUST use this real data in your analysis.
- The trendData array MUST use the real market search values when available — do not make up numbers.
- The competitorCount MUST match the provided competitor count when available.
- Reference the real data numbers in your chatResponse and explanation using phrases like "Our market intelligence shows..." or "BizQuest data indicates...". NEVER mention Google, Google Trends, Google Places, or any third-party data source by name.
- The dataSources array MUST list: ${JSON.stringify(dataSources)}
- Use the LOCAL CURRENCY for price ranges (KES for Kenya, ZAR for South Africa, USD for USA, etc.)
- Reference LOCAL platforms and channels (M-Pesa/Jiji for Kenya, Takealot/Gumtree for SA, Amazon/Etsy for US, etc.)

Consider:
${localKnowledge}
- Real demand signals for this product category in this region
- Price sensitivity for the given price range vs local income levels
${realDataContext}

For the chatResponse field, format it nicely with markdown:
- Use **bold** for key metrics
- Use line breaks between sections
- Include relevant emoji for visual appeal
- Start with the product name and location
- Include a clear verdict
- Present data confidently as BizQuest's own insights (e.g., "📊 Our market data shows..." or "📍 We found X competitors nearby...")

Be specific and realistic. Give a concrete, actionable analysis grounded in real data.

User Question: "${query.slice(0, 500)}"

Respond with valid JSON matching the schema.`
        }]
      }],
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a senior global business consultant for BizQuest. You have deep expertise in markets across Africa, the Americas, Europe, and Asia. Always return valid JSON matching the schema. Be data-driven — when provided with real market data, use those exact numbers. Never contradict the real data provided. NEVER mention Google, Google Trends, Google Places or any third-party data source. Present all insights as BizQuest's proprietary market intelligence. Always use the local currency and reference local platforms relevant to the detected country.",
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const parsed = JSON.parse(resultText);
    // Ensure dataSources is always accurate
    parsed.dataSources = dataSources;

    // Save to cache (fire-and-forget)
    supabase
      .from('analysis_cache')
      .insert({ query_key: cacheKey, result: parsed })
      .then(() => {})
      .catch(() => {});

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
