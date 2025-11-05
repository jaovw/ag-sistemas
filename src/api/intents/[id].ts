import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdmin } from '../middleware/authAdmin';
import { intentService } from '../services/intentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdmin(req, res)) return;

  const { id } = req.query;
  const { action } = req.body;

  try {
    const result = await intentService.processIntent(Number(id), action);
    res.status(200).json({ ok: true, result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
