import type { VercelRequest, VercelResponse } from '@vercel/node';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '';
const PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';
const BASE_URL = MPESA_ENV === 'live'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const MPESA_TEST_NUMBER = '254708374149';

async function getAccessToken(): Promise<string> {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  const APP_URL = process.env.PRODUCTION_URL || 'https://bizquest-eight.vercel.app';
  const allowedOrigin = origin.endsWith('.vercel.app') || origin.includes('localhost') ? origin : APP_URL;
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, amount, userId } = req.body as { phone: string; amount: number; userId?: string };

  if (!phone || !amount) {
    return res.status(400).json({ error: 'Phone and amount are required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'Authentication required. Please sign in.' });
  }

  // Normalize phone number to 254XXXXXXXXX format
  let normalizedPhone = phone.trim().replace(/\s+/g, '').replace(/^0/, '254').replace(/^\+/, '');
  if (!normalizedPhone.startsWith('254')) {
    normalizedPhone = `254${normalizedPhone}`;
  }

  // Strict Kenyan phone validation: must be 254 + 9 digits
  if (!/^254\d{9}$/.test(normalizedPhone)) {
    return res.status(400).json({ error: 'Invalid phone number. Use format: 07XXXXXXXX or 254XXXXXXXXX' });
  }

  // M-Pesa sandbox test number — auto-approve only in sandbox mode
  if (MPESA_ENV !== 'live' && normalizedPhone === MPESA_TEST_NUMBER) {
    const testCheckoutId = `ws_CO_TEST_${Date.now()}`;
    return res.status(200).json({
      success: true,
      checkoutRequestId: testCheckoutId,
      message: 'STK Push sent. Check your phone.',
    });
  }

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    return res.status(500).json({ error: 'M-Pesa credentials not configured. Please contact support.' });
  }

  try {
    const token = await getAccessToken();

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://bizquest.vercel.app/api/mpesa-callback';

    const stkBody = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: normalizedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: 'BizQuest',
      TransactionDesc: 'BizQuest Premium Access - 5 Credits',
    };

    const stkRes = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkBody),
    });

    const stkData = await stkRes.json() as {
      ResponseCode?: string;
      CheckoutRequestID?: string;
      ResponseDescription?: string;
      CustomerMessage?: string;
      errorCode?: string;
      errorMessage?: string;
    };

    if (!stkRes.ok || stkData.errorCode) {
      return res.status(400).json({
        error: stkData.errorMessage || stkData.ResponseDescription || 'STK Push failed'
      });
    }

    return res.status(200).json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      message: stkData.CustomerMessage || 'STK Push sent. Check your phone.',
    });

  } catch (err: unknown) {
    const ref = Math.random().toString(36).slice(2, 8);
    console.error(`M-Pesa STK error (ref:${ref}):`, err instanceof Error ? err.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to initiate M-Pesa payment. Please try again.' });
  }
}
