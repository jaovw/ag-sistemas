// src/api/intents/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdmin } from '../middleware/authAdmin';
import { intentService } from '../services/intentService';
import { z } from 'zod';

const IntentSchema = z.object({
  name: z.string(),
  email: z.email(),
  company: z.string().optional(),
  message: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const parsed = IntentSchema.safeParse(req.body);

    if (!parsed.success) {
      // Use .format() for a structured, serializable error object
      return res.status(400).json({ error: parsed.error.format() });
    }

    const intent = await intentService.createIntent(parsed.data);
    return res.status(201).json(intent);
  }

  if (req.method === 'GET') {
    if (!verifyAdmin(req, res)) return;
    const intents = await intentService.listIntents();
    return res.status(200).json(intents);
  }

  res.status(405).end();
}
