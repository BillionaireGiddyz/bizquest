import type { VercelRequest } from '@vercel/node';

export const APP_URL = 'https://bizquest-eight.vercel.app';

export function getAllowedOrigin(req: VercelRequest): string {
  const origin = req.headers.origin || '';
  if (origin.includes('localhost')) {
    return origin;
  }

  return APP_URL;
}

export function getAppCallbackUrl(path: string): string {
  return `${APP_URL}${path}`;
}
