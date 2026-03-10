import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value: string | number }>;
      };
    };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Safaricom doesn't send CORS headers, but keep for safety
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as MpesaCallbackBody;
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return res.status(400).json({ error: 'Invalid callback format' });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item || [];
      const amount = items.find(i => i.Name === 'Amount')?.Value;
      const mpesaCode = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const phone = items.find(i => i.Name === 'PhoneNumber')?.Value;

      console.log(`Payment success: CheckoutID=${CheckoutRequestID}, Amount=${amount}, Code=${mpesaCode}, Phone=${phone}`);

      // Persist to database for audit trail
      const { error: insertErr } = await supabase.from('mpesa_payments').insert({
        checkout_request_id: CheckoutRequestID,
        result_code: ResultCode,
        result_desc: ResultDesc,
        amount,
        mpesa_code: mpesaCode,
        phone,
        status: 'paid',
        created_at: new Date().toISOString(),
      });
      if (insertErr) console.error('Failed to persist M-Pesa callback:', insertErr);
    } else {
      console.log(`Payment failed: CheckoutID=${CheckoutRequestID}, Code=${ResultCode}, Desc=${ResultDesc}`);

      const { error: insertErr } = await supabase.from('mpesa_payments').insert({
        checkout_request_id: CheckoutRequestID,
        result_code: ResultCode,
        result_desc: ResultDesc,
        status: 'failed',
        created_at: new Date().toISOString(),
      });
      if (insertErr) console.error('Failed to persist M-Pesa callback:', insertErr);
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  } catch (err) {
    console.error('Callback error:', err);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
