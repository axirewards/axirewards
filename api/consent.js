import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  const { userId, consent } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const { error } = await supabase
    .from('users')
    .update({ consent })
    .eq('id', userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
