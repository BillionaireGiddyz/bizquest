import { AnalysisResult } from "../types";

export const analyzeMarketQuery = async (query: string): Promise<AnalysisResult> => {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Analysis request failed');
  }

  const parsed = await res.json() as AnalysisResult;
  return parsed;
};
