import type { NextApiRequest, NextApiResponse } from 'next';
import { inviteService } from '../services/inviteService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token } = req.query;
    const intent = await inviteService.validateToken(String(token));
    res.status(200).json({ ok: true, intent });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
}
