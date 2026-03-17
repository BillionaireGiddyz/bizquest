import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getAllowedOrigin } from './_app.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any,
});

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required for payment operations');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Payment service misconfigured' });
  }

  const { sessionId } = req.body as { sessionId: string };

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Prevent replay: check if this session was already redeemed
      // by looking at the metadata — we mark it after first use
      if (session.metadata?.redeemed === 'true') {
        return res.status(200).json({ paid: false, error: 'Already redeemed' });
      }

      // Mark session as redeemed to prevent replay
      await stripe.checkout.sessions.update(sessionId, {
        metadata: { ...session.metadata, redeemed: 'true' },
      } as any);

      const userId = session.metadata?.userId;
      const CREDITS_PER_PURCHASE = 5; // Single tier — hardcoded, not from metadata
      let serverCredited = false;

      // Add credits SERVER-SIDE so the client can't manipulate the amount
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        if (profile) {
          const newCredits = (profile.credits || 0) + CREDITS_PER_PURCHASE;
          const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ credits: newCredits, credits_expire_at: expiry })
            .eq('id', userId);
          serverCredited = !updateErr;
          if (updateErr) console.error('Failed to credit user server-side:', updateErr);
        }
      }

      return res.status(200).json({
        paid: true,
        credits: CREDITS_PER_PURCHASE,
        serverCredited,
      });
    }

    return res.status(200).json({ paid: false });
  } catch (err: unknown) {
    console.error('Stripe verify error:', err);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
}
