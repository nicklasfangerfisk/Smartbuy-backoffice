import type { VercelRequest, VercelResponse } from '@vercel/node';
import { twilioClient, TWILIO_MESSAGING_SERVICE_SID } from '../../utils/twilioClient';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { message } = req.body;
    const { data: users, error: fetchError } = await supabase.from('users').select('phone');
    if (fetchError) throw fetchError;
    const numbers = (users || []).map((u: any) => u.phone).filter(Boolean);
    if (!numbers.length) throw new Error('No phone numbers found');
    const results = await Promise.all(numbers.map((to: string) =>
      twilioClient.messages.create({
        to,
        messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
        body: message || 'This is a test SMS campaign!'
      })
    ));
    res.status(200).json({ success: true, sent: results.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
}
