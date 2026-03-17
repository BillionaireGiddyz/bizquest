import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import googleTrends from 'google-trends-api';
import { createClient } from '@supabase/supabase-js';
import { APP_URL } from './_app';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

const CACHE_TTL_HOURS = 24;

// ── Simple in-memory rate limiter ────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 15; // max 15 analyses per IP per hour
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

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  APP_URL,
].filter(Boolean);

function getCorsOrigin(req: VercelRequest): string {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return APP_URL;
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

type ExtractedQuery = {
  product: string;
  location: string;
  country: string;
  geoCode: string;
};

type AnalysisPayload = Record<string, unknown>;

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

function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const candidate = extractJsonObject(text);
    if (!candidate) return null;
    try {
      return JSON.parse(candidate) as T;
    } catch {
      return null;
    }
  }
}

function inferCompetitionLevel(count: number): 'Low' | 'Medium' | 'High' {
  if (count <= 5) return 'Low';
  if (count <= 15) return 'Medium';
  return 'High';
}

function inferTimingStatus(direction: TrendsResult['trendDirection']): 'Early' | 'On-time' | 'Late' {
  if (direction === 'rising') return 'Early';
  if (direction === 'declining') return 'Late';
  return 'On-time';
}

function inferRecommendation(demandScore: number, competitionLevel: 'Low' | 'Medium' | 'High', timingStatus: 'Early' | 'On-time' | 'Late'): 'GO' | 'BE CAREFUL' | 'AVOID' {
  if (demandScore >= 70 && competitionLevel !== 'High' && timingStatus !== 'Late') return 'GO';
  if (demandScore <= 40 || timingStatus === 'Late') return 'AVOID';
  return 'BE CAREFUL';
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function coerceAnalysisResult(
  raw: AnalysisPayload | null,
  context: {
    product: string;
    location: string;
    dataSources: string[];
    trends: TrendsResult;
    competitors: CompetitorResult;
  }
) {
  const demandScore = Math.max(0, Math.min(100, Number(raw?.demandScore) || context.trends.averageInterest || 55));
  const competitorCount = Number(raw?.competitorCount) || context.competitors.count || 0;
  const competitionLevel = (typeof raw?.competitionLevel === 'string' ? raw.competitionLevel : inferCompetitionLevel(competitorCount)) as 'Low' | 'Medium' | 'High';
  const trendDirection = (typeof raw?.trendDirection === 'string' ? raw.trendDirection : context.trends.trendDirection || 'stable') as 'rising' | 'stable' | 'declining';
  const timingStatus = (typeof raw?.timingStatus === 'string' ? raw.timingStatus : inferTimingStatus(trendDirection)) as 'Early' | 'On-time' | 'Late';
  const recommendation = (typeof raw?.recommendation === 'string'
    ? raw.recommendation
    : inferRecommendation(demandScore, competitionLevel, timingStatus)) as 'GO' | 'BE CAREFUL' | 'AVOID';
  const explanation = typeof raw?.explanation === 'string' && raw.explanation.trim()
    ? raw.explanation
    : `BizQuest Quantum detected a demand score of ${demandScore}/100 in ${context.location}. Competition is ${competitionLevel.toLowerCase()} with ${competitorCount} nearby operators identified. Timing currently reads ${timingStatus.toLowerCase()}, which supports a ${recommendation} recommendation.`;
  const chatResponse = typeof raw?.chatResponse === 'string' && raw.chatResponse.trim()
    ? raw.chatResponse
    : `## ${context.product} - ${context.location}\n\n📊 **Demand score:** ${demandScore}/100\n📍 **Competition:** ${competitionLevel}\n⚡ **Timing:** ${timingStatus}\n🏆 **Verdict:** **${recommendation}**\n\n${explanation}`;

  const trendData = Array.isArray(raw?.trendData) && raw?.trendData.length
    ? raw.trendData
    : (context.trends.timeline.length
      ? context.trends.timeline.map((point) => ({
          period: point.date.slice(0, 3),
          interestLevel: point.value,
        }))
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((period, index) => ({
          period,
          interestLevel: Math.max(25, Math.min(95, demandScore - 10 + index * 2)),
        })));

  return {
    productName: typeof raw?.productName === 'string' && raw.productName.trim() ? raw.productName : context.product,
    location: typeof raw?.location === 'string' && raw.location.trim() ? raw.location : context.location,
    priceRange: typeof raw?.priceRange === 'string' && raw.priceRange.trim() ? raw.priceRange : 'Market Rate',
    demandScore,
    saturationLevel: (typeof raw?.saturationLevel === 'string' ? raw.saturationLevel : competitionLevel) as 'Low' | 'Medium' | 'High',
    competitionLevel,
    timingStatus,
    recommendation,
    explanation,
    chatResponse,
    trendData,
    keyInsights: ensureStringArray(raw?.keyInsights).slice(0, 4).length
      ? ensureStringArray(raw?.keyInsights).slice(0, 4)
      : [
          `Demand in ${context.location} is tracking at ${demandScore}/100.`,
          `${competitorCount} nearby competitors suggest ${competitionLevel.toLowerCase()} market pressure.`,
          `Current trend direction is ${trendDirection}, which points to ${timingStatus.toLowerCase()} market timing.`,
        ],
    targetDemographic: typeof raw?.targetDemographic === 'string' && raw.targetDemographic.trim()
      ? raw.targetDemographic
      : `Buyers in ${context.location} looking for convenience-led, value-conscious offers.`,
    bestSellingChannels: ensureStringArray(raw?.bestSellingChannels).slice(0, 3).length
      ? ensureStringArray(raw?.bestSellingChannels).slice(0, 3)
      : ['Instagram', 'WhatsApp', 'Direct storefront'],
    dataSources: context.dataSources,
    competitorCount,
    nearbyCompetitors: ensureStringArray(raw?.nearbyCompetitors).length
      ? ensureStringArray(raw?.nearbyCompetitors).slice(0, 8)
      : context.competitors.nearbyNames.slice(0, 8),
    googleTrendsAvg: Number(raw?.googleTrendsAvg) || context.trends.averageInterest || demandScore,
    trendDirection,
    relatedSearches: ensureStringArray(raw?.relatedSearches).length
      ? ensureStringArray(raw?.relatedSearches).slice(0, 5)
      : context.trends.relatedQueries.slice(0, 5),
  };
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
      description: "A 4-6 sentence expert explanation that reads like a $500 consulting report. Reference real market data with exact numbers. Apply risk-weighted reasoning — explain WHY the recommendation is what it is by connecting demand + competition + timing signals. Cite specific numbers but NEVER mention Google Trends or Google Places. Present as BizQuest Quantum's proprietary probabilistic analysis."
    },
    chatResponse: {
      type: Type.STRING,
      description: "A premium, markdown-formatted market intelligence briefing. Structure: market overview → demand signals → competition landscape → timing analysis → risk assessment → bold verdict. Reference real data numbers with authority ('BizQuest Quantum detected...', 'Our demand index shows...'). NEVER mention Google or third-party sources. Use **bold** for metrics, emoji for visual hierarchy (📊📍🎯⚡🏆), and line breaks between sections. Make it feel like the most valuable free analysis the user has ever received."
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

  // Rate limit by IP
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a few minutes before trying again.' });
  }

  const { query: rawQuery } = req.body as { query: string };
  if (!rawQuery || typeof rawQuery !== 'string' || rawQuery.trim().length === 0) {
    return res.status(400).json({ error: 'Query is required' });
  }
  if (rawQuery.length > 500) {
    return res.status(400).json({ error: 'Query too long. Please keep it under 500 characters.' });
  }
  // Sanitize: keep letters (any script), numbers, basic punctuation, strip the rest
  const query = rawQuery.trim().replace(/[^\p{L}\p{N}\s&\-,.()'?!:]/gu, '').slice(0, 300);
  if (query.length < 3) {
    return res.status(400).json({ error: 'Query too short. Please describe what you want to analyze.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  // Normalize query for cache key
  const cacheKey = query.trim().toLowerCase().replace(/\s+/g, ' ');

  // Check cache first
  try {
    if (supabase) {
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
    }
  } catch {
    // Cache miss or table doesn't exist yet — continue with fresh analysis
  }

  // Helper: call Gemini with automatic model fallback
  const MODELS = ['gemini-3-flash-preview', 'gemini-2.5-flash'] as const;
  async function callWithFallback(config: Parameters<typeof ai.models.generateContent>[0]) {
    for (const modelId of MODELS) {
      try {
        return await ai.models.generateContent({ ...config, model: modelId });
      } catch (err: unknown) {
        const msg = String(err);
        const retryable = msg.includes('503') || msg.includes('429') ||
          msg.toLowerCase().includes('overloaded') || msg.toLowerCase().includes('unavailable') ||
          msg.toLowerCase().includes('quota');
        console.warn(`Model ${modelId} failed (retryable=${retryable})`);
        if (!retryable || modelId === MODELS[MODELS.length - 1]) throw err;
      }
    }
    throw new Error('All models failed');
  }

  try {
    // Step 1: Extract product, location, and country from query
    const extractRes = await callWithFallback({
      model: MODELS[0],
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

    const extracted = safeJsonParse<ExtractedQuery>(extractRes.text || '') || { product: query.slice(0, 50), location: 'General', country: '', geoCode: '' };
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

    // Step 3: Full analysis with real data context (uses fallback helper)
    const response = await callWithFallback({
      model: MODELS[0],
      contents: [{
        role: "user",
        parts: [{
          text: `You are BizQuest Quantum — the most advanced market intelligence engine ever built.
${regionContext}

Conduct a full probabilistic market analysis using every data signal available.

CRITICAL INSTRUCTIONS:
- You have been provided REAL market data below. You MUST use this real data — these are verified signals from BizQuest's proprietary data network.
- The trendData array MUST use the real market search values when available — do not fabricate numbers.
- The competitorCount MUST match the provided competitor count when available.
- Reference real data numbers in your chatResponse and explanation using phrases like "BizQuest Quantum Intelligence reveals..." or "Our proprietary market scan detected...". NEVER mention Google, Google Trends, Google Places, or any third-party data source by name.
- The dataSources array MUST list: ${JSON.stringify(dataSources)}
- Use the LOCAL CURRENCY for price ranges (KES for Kenya, ZAR for South Africa, USD for USA, etc.)
- Reference LOCAL platforms and channels (M-Pesa/Jiji for Kenya, Takealot/Gumtree for SA, Amazon/Etsy for US, etc.)

ANALYTICAL DEPTH REQUIREMENTS:
${localKnowledge}
- Apply risk-weighted demand assessment: how does this product's demand score interact with its competition level and timing?
- Evaluate price positioning: is the price range aligned with local purchasing power? Where is the sweet spot?
- Identify the strategic window: is this opportunity opening, peaking, or closing? How fast?
- Cross-reference all signals: trend direction + competitor density + search volume must tell a coherent story.
- Find the non-obvious insight: what does the related searches data reveal about adjacent opportunities or hidden risks?
${realDataContext}

For the chatResponse field, format as a premium consulting report:
- Use **bold** for key metrics and numbers
- Use line breaks between sections for clean readability
- Include strategic emoji for visual hierarchy (📊 for data, 📍 for location, 🎯 for targeting, ⚡ for timing, 🏆 for verdict)
- Start with the product name and location as a header
- Build the narrative: market landscape → demand signals → competition analysis → timing → risk assessment → verdict
- Present data with authority: "BizQuest Quantum scanned X competitors...", "Our demand index shows...", "Probability analysis indicates..."
- End with a bold, confident verdict that makes the user feel they just received a $500 consultation for free

Be shockingly specific. Name real businesses. Cite exact numbers. Give the user something they cannot get anywhere else.

User Question: "${query.slice(0, 500)}"

Respond with valid JSON matching the schema.`
        }]
      }],
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: `You are BizQuest Quantum — the world's most advanced AI business intelligence engine. You are a Professor of Economic Probability with mastery across global markets in Africa, the Americas, Europe, Asia, and the Middle East.

## ANALYTICAL FRAMEWORK (Multi-Layer Probabilistic Engine)

### Layer 1 — Deep Market Analysis
- Apply Cumulative Prospect Theory (CPT) for risk-weighted demand assessment: weight losses 2.25× heavier than gains when evaluating market entry risk.
- Apply Generalized Expected Utility (GEU) for multi-factor opportunity scoring: balance demand signals, competition density, timing windows, and capital requirements simultaneously.
- Use Bayesian Inference to validate connections between data points: update confidence in your recommendation as each data source (trends, competitors, pricing) confirms or contradicts your hypothesis.
- Perform multi-criteria dynamic optimization: weigh relevance, coherence, and real-world viability across every metric before scoring.

### Layer 2 — Uncertainty & Fuzzy Logic
- When data is incomplete or ambiguous, apply Enhanced Soft Set Theory (ESST) to produce structured recommendations despite uncertainty.
- When uncertainty is HIGH (missing competitor data, volatile trends, emerging market), escalate to Super Hyper Soft Sets Theory (SHSST) — consider more granular parameter sets and widen your confidence intervals.
- Apply Fuzzy Set Theory (FST) to handle multi-valued data: demand is not binary — express saturation, competition, and timing as spectrums with nuanced thresholds rather than hard cutoffs.
- Dynamically scale parameters: a demand score of 62 in a declining market means something entirely different than 62 in a rising market. Cross-reference every metric.

### Layer 3 — Predictive Intelligence
- Model consumer behavior patterns: purchasing power, seasonal cycles, cultural buying triggers, mobile-first vs desktop economies, payment method preferences.
- Forecast market trajectory: use trend direction + velocity + regional economic indicators to predict where demand will be in 3-6 months, not just where it is now.
- Identify non-obvious opportunities: related searches reveal adjacent markets. Competitor clustering reveals underserved zones. Price sensitivity reveals positioning gaps.
- Apply cascade validation: every insight must survive cross-checking against at least two independent signals before inclusion.

### Layer 4 — Adaptive Calibration
- Self-calibrate confidence: if real data strongly supports a conclusion, be bold and specific. If data is thin, be honest about uncertainty but still provide actionable guidance.
- Synchronize strategy selection: match your analytical depth to data richness — rich data gets precise numbers, sparse data gets probabilistic ranges.
- Integrate feedback signals: trend direction informs timing, competitor count informs saturation, search volume informs demand — never analyze these in isolation.

## OUTPUT DIRECTIVES
- Always return valid JSON matching the schema exactly.
- Be data-driven — when provided with real market data, use those EXACT numbers. Never contradict or fabricate over real data.
- NEVER mention Google, Google Trends, Google Places, or any third-party data source by name.
- Present ALL insights as BizQuest's proprietary Quantum Market Intelligence™.
- Always use the local currency and reference local platforms relevant to the detected country.
- Your analysis should feel like it cost $500 from a top-tier consulting firm — precise, data-rich, shockingly accurate, and immediately actionable.
- Be specific: name real competitor businesses, cite exact numbers, give concrete price positioning advice, identify the exact customer segment.
- When giving a GO recommendation, make the user feel confident. When giving AVOID, make them grateful you saved them money. When giving BE CAREFUL, give them the exact conditions under which it becomes a GO.`,
      },
    });

    const resultText = response.text || '';
    let parsed = safeJsonParse<AnalysisPayload>(resultText);

    if (!parsed) {
      const plainJsonResponse = await callWithFallback({
        model: MODELS[0],
        contents: [{
          role: "user",
          parts: [{
            text: `Return valid JSON only for this market analysis request. Do not wrap it in markdown fences.
User question: "${query.slice(0, 500)}"
Product: "${product}"
Location: "${location}"
Country: "${country}"
Demand average: ${trends.averageInterest}
Trend direction: ${trends.trendDirection}
Competitor count: ${competitors.count}
Related searches: ${trends.relatedQueries.join(', ') || 'none'}`
          }]
        }],
        config: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      });

      parsed = safeJsonParse<AnalysisPayload>(plainJsonResponse.text || '');
    }

    const normalized = coerceAnalysisResult(parsed, {
      product,
      location,
      dataSources,
      trends,
      competitors,
    });

    // Save to cache (fire-and-forget)
    if (supabase) {
      supabase
        .from('analysis_cache')
        .insert({ query_key: cacheKey, result: normalized })
        .then(() => {});
    }

    return res.status(200).json(normalized);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const ref = Math.random().toString(36).slice(2, 8);
    console.error(`Analysis failed (ref:${ref}):`, message);
    const isQuota = message.includes('429') || message.toLowerCase().includes('quota');
    const isOverloaded = message.includes('503') || message.toLowerCase().includes('overloaded');
    const clientMessage = isQuota
      ? 'AI service is busy. Please try again in a moment.'
      : isOverloaded
      ? 'AI service is temporarily unavailable. Please try again shortly.'
      : 'Analysis failed. Please try again.';
    return res.status(500).json({ error: clientMessage });
  }
}
