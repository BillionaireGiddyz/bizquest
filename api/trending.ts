import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAllowedOrigin } from './_app.js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST: log a new search (called after each analysis)
  if (req.method === 'POST') {
    const { productName, location, recommendation, demandScore } = req.body as {
      productName: string;
      location: string;
      recommendation: string;
      demandScore: number;
    };

    if (!productName) return res.status(400).json({ error: 'productName required' });
    if (!supabase) return res.status(200).json({ ok: true });

    try {
      await supabase.from('trending_searches').insert({
        product_name: productName.slice(0, 100),
        location: (location || 'General').slice(0, 100),
        recommendation,
        demand_score: demandScore,
        searched_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(200).json({ ok: true }); // Non-critical, don't fail
    }
  }

  // GET: return trending searches from the last 7 days
  if (req.method === 'GET') {
    try {
      if (!supabase) return res.status(200).json([]);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('trending_searches')
        .select('product_name, location, recommendation, demand_score, searched_at')
        .gte('searched_at', sevenDaysAgo)
        .order('searched_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Aggregate: count searches per product+location, pick top 8
      const counts: Record<string, {
        productName: string;
        location: string;
        count: number;
        avgDemand: number;
        lastRecommendation: string;
        lastSearched: string;
      }> = {};

      for (const row of data || []) {
        const key = `${row.product_name.toLowerCase()}|${row.location.toLowerCase()}`;
        if (!counts[key]) {
          counts[key] = {
            productName: row.product_name,
            location: row.location,
            count: 0,
            avgDemand: 0,
            lastRecommendation: row.recommendation,
            lastSearched: row.searched_at,
          };
        }
        counts[key].count++;
        counts[key].avgDemand += row.demand_score || 0;
      }

      const trending = Object.values(counts)
        .map(item => ({
          ...item,
          avgDemand: Math.round(item.avgDemand / item.count),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return res.status(200).json({ trending });
    } catch {
      return res.status(200).json({ trending: [] });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
