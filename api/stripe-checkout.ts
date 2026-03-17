import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { APP_URL, getAllowedOrigin } from './_app.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, userEmail } = req.body as { userId?: string; userEmail?: string };

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BizQuest Premium — 5 Analysis Credits',
              description: '5 AI-powered market analysis credits valid for 30 days',
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        credits: '5',
      },
      success_url: `${APP_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
}
