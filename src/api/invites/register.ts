import type { NextApiRequest, NextApiResponse } from 'next';
import { inviteService } from '../services/inviteService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, name, email, company } = req.body;
  try {
    const member = await inviteService.registerMember(token, { name, email, company });
    res.status(201).json({ ok: true, member });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
}
