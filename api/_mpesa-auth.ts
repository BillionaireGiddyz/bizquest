import type { VercelRequest } from '@vercel/node';

export const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
export const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
export const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
export const PASSKEY = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
export const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';

export const BASE_URL = MPESA_ENV === 'live'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

export async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token error: ${res.status} - ${text}`);
  }
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
}

export function generatePassword(timestamp: string): string {
  return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
}

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.PRODUCTION_URL || '',
].filter(Boolean);

export function getCorsOrigin(req: VercelRequest): string {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.endsWith('.vercel.app')) return origin;
  return ALLOWED_ORIGINS[0] || '*';
}
