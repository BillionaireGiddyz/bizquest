import type { VercelRequest, VercelResponse } from '@vercel/node';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const PASSKEY = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';

const BASE_URL = MPESA_ENV === 'live'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { checkoutRequestId } = req.body as { checkoutRequestId: string };
  if (!checkoutRequestId) return res.status(400).json({ error: 'checkoutRequestId required' });

  try {
    const token = await getAccessToken();
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const queryRes = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    });

    const data = await queryRes.json() as {
      ResultCode?: string;
      ResultDesc?: string;
      ResponseCode?: string;
      ResponseDescription?: string;
    };

    // ResultCode "0" = success, "1032" = cancelled, "1037" = timeout
    const paid = data.ResultCode === '0';
    const cancelled = data.ResultCode === '1032';

    return res.status(200).json({
      paid,
      cancelled,
      resultCode: data.ResultCode,
      resultDesc: data.ResultDesc || data.ResponseDescription,
    });
  } catch (err) {
    console.error('Query error:', err);
    return res.status(500).json({ error: 'Failed to query payment status' });
  }
}
