import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env.GEMINI_API_KEY) || (process.env.API_KEY) || '';
const ai = new GoogleGenAI({ apiKey });

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
    }
  },
  required: ["productName","location","priceRange","demandScore","saturationLevel","competitionLevel","timingStatus","recommendation","explanation","trendData"],
};

export const analyzeMarketQuery = async (query: string): Promise<AnalysisResult> => {
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

Be specific and realistic. Give a concrete, actionable analysis.

User Question: "${query}"

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
    if (!resultText) throw new Error("No response from Gemini");

    const parsedResult = JSON.parse(resultText);

    let demandLevel = "Moderate";
    if (parsedResult.demandScore < 35) demandLevel = "Low";
    else if (parsedResult.demandScore < 55) demandLevel = "Moderate";
    else if (parsedResult.demandScore < 75) demandLevel = "Good";
    else demandLevel = "High";

    const recLabel =
      parsedResult.recommendation === 'GO' ? '✅ Strong opportunity detected'
      : parsedResult.recommendation === 'AVOID' ? '⚠️ High risk — not recommended right now'
      : '⚡ Proceed with a clear strategy';

    const formattedChatResponse = `Here's my analysis for **${parsedResult.productName}** in **${parsedResult.location}**:\n\n📊 Demand Level: ${demandLevel} (${parsedResult.demandScore}/100)\n🏪 Market Saturation: ${parsedResult.saturationLevel}\n⚔️ Competition: ${parsedResult.competitionLevel}\n⏱️ Market Timing: ${parsedResult.timingStatus}\n\n**Verdict: ${recLabel}**\n\n${parsedResult.explanation}`;

    return { ...parsedResult, chatResponse: formattedChatResponse } as AnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      productName: "Unknown Product",
      location: "Unknown",
      priceRange: "Unknown",
      demandScore: 50,
      saturationLevel: "Medium",
      competitionLevel: "Medium",
      timingStatus: "On-time",
      recommendation: "BE CAREFUL",
      explanation: "We couldn't process this request. Please rephrase with a product name and location.",
      chatResponse: "I had trouble analyzing that. Try again with more detail — e.g. 'Will a KES 500 phone case sell well in Westlands?'",
      trendData: [
        { period: "3M ago", interestLevel: 40 },
        { period: "2M ago", interestLevel: 45 },
        { period: "Last M", interestLevel: 50 },
        { period: "Now", interestLevel: 50 },
        { period: "Next M", interestLevel: 55 },
        { period: "In 2M", interestLevel: 58 }
      ]
    };
  }
};
