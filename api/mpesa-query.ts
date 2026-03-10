import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required for payment operations');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '';
const PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';
const BASE_URL = MPESA_ENV === 'live'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CREDITS_PER_PURCHASE = 5;

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

async function creditUserAccount(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  const newCredits = (profile.credits || 0) + CREDITS_PER_PURCHASE;
  const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('profiles')
    .update({ credits: newCredits, credits_expire_at: expiry })
    .eq('id', userId);

  return !error;
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

  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Payment service misconfigured' });
  }

  const { checkoutRequestId, userId } = req.body as { checkoutRequestId: string; userId?: string };
  if (!checkoutRequestId) return res.status(400).json({ error: 'checkoutRequestId required' });
  if (!userId) return res.status(400).json({ error: 'userId required' });

  // Auto-approve test checkout IDs only in sandbox mode
  if (MPESA_ENV !== 'live' && checkoutRequestId.startsWith('ws_CO_TEST_')) {
    // Race-safe sandbox crediting — same insert-first pattern
    let sandboxCredited = false;
    const { error: sandboxInsertErr } = await supabase
      .from('mpesa_payments')
      .insert({
        checkout_request_id: checkoutRequestId,
        user_id: userId,
        result_code: 0,
        status: 'credited',
        created_at: new Date().toISOString(),
      });

    if (sandboxInsertErr && sandboxInsertErr.code === '23505') {
      sandboxCredited = true; // Already credited
    } else if (!sandboxInsertErr) {
      sandboxCredited = await creditUserAccount(userId);
      if (!sandboxCredited) {
        await supabase.from('mpesa_payments').delete().eq('checkout_request_id', checkoutRequestId);
      }
    }

    return res.status(200).json({
      paid: true,
      cancelled: false,
      serverCredited: sandboxCredited,
      resultCode: '0',
      resultDesc: 'The service request is processed successfully.',
    });
  }

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

    const paid = data.ResultCode === '0';
    // 1032 = cancelled by user, 1037 = DS timeout, 1 = insufficient balance,
    // 2001 = wrong PIN, 1025 = transaction limit, 1019 = expired
    const failedCodes = ['1032', '1037', '1', '2001', '1025', '1019'];
    const cancelled = data.ResultCode ? failedCodes.includes(data.ResultCode) : false;

    // Credit user server-side when payment confirmed
    let serverCredited = false;
    if (paid && userId) {
      // Race-safe: INSERT the "credited" record FIRST as a lock.
      // If a concurrent request already inserted it, this will fail (conflict),
      // preventing double-crediting.
      const { error: insertErr } = await supabase
        .from('mpesa_payments')
        .insert({
          checkout_request_id: checkoutRequestId,
          user_id: userId,
          result_code: 0,
          status: 'credited',
          created_at: new Date().toISOString(),
        });

      if (insertErr) {
        // Conflict = already credited by another request — that's fine
        if (insertErr.code === '23505') {
          serverCredited = true; // Already credited before
        } else {
          console.error('Failed to insert mpesa_payment record:', insertErr);
        }
      } else {
        // We own the lock — now safely credit the user
        serverCredited = await creditUserAccount(userId);
        if (!serverCredited) {
          // Crediting failed — remove the lock so it can be retried
          await supabase
            .from('mpesa_payments')
            .delete()
            .eq('checkout_request_id', checkoutRequestId);
        }
      }
    }

    return res.status(200).json({
      paid,
      cancelled,
      serverCredited,
      resultCode: data.ResultCode,
      resultDesc: data.ResultDesc || data.ResponseDescription,
    });
  } catch (err) {
    console.error('Query error:', err);
    return res.status(500).json({ error: 'Failed to query payment status' });
  }
}
