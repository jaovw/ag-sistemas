import type { NextApiRequest, NextApiResponse } from 'next';

export function verifyAdmin(req: NextApiRequest, res: NextApiResponse): boolean {
  const secret = req.headers['x-admin-secret'] || req.query.adminSecret;

  if (secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
