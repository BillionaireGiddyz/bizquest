import { AnalysisResult } from "../types";

const ANALYSIS_TIMEOUT_MS = 70000;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

async function readErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const err = await res.json().catch(() => ({}));
    return (err as { error?: string }).error || 'Analysis request failed';
  }

  const text = await res.text().catch(() => '');
  return text.trim() || 'Analysis request failed';
}

export const analyzeMarketQuery = async (query: string, userId?: string): Promise<AnalysisResult> => {
  const runRequest = async (attempt: number): Promise<AnalysisResult> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const message = await readErrorMessage(res);
        if (attempt === 0 && RETRYABLE_STATUS.has(res.status)) {
          return runRequest(1);
        }
        throw new Error(message);
      }

      const parsed = await res.json() as AnalysisResult;
      if (!parsed?.chatResponse || !parsed?.productName) {
        throw new Error('Analysis response was incomplete. Please try again.');
      }

      return parsed;
    } catch (error) {
      if (attempt === 0) {
        const isAbort = error instanceof DOMException && error.name === 'AbortError';
        const isNetwork = error instanceof TypeError;
        if (isAbort || isNetwork) {
          return runRequest(1);
        }
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Analysis timed out. Please try again.');
      }

      throw error instanceof Error ? error : new Error('Analysis request failed');
    } finally {
      clearTimeout(timeout);
    }
  };

  return runRequest(0);
};
