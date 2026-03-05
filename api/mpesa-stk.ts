import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAccessToken, SHORTCODE, BASE_URL, generateTimestamp, generatePassword, getCorsOrigin } from './_mpesa-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, amount } = req.body as { phone: string; amount: number };

  if (!phone || !amount) {
    return res.status(400).json({ error: 'Phone and amount are required' });
  }

  // Normalize phone number to 254XXXXXXXXX format
  let normalizedPhone = phone.replace(/\s+/g, '').replace(/^0/, '254').replace(/^\+/, '');
  if (!normalizedPhone.startsWith('254')) {
    normalizedPhone = `254${normalizedPhone}`;
  }

  try {
    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

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
    console.error('M-Pesa STK error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
}
