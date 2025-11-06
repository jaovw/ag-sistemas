import { NextResponse } from 'next/server';
import { intentService } from '@/server/services/intentService';
import { z } from 'zod';

const IntentSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  company: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = IntentSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message);
    return NextResponse.json({ error: messages }, { status: 400 });
  }

  const intent = await intentService.createIntent(parsed.data);
  return NextResponse.json(intent, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const adminSecretHeader = req.headers.get('x-admin-secret');
  const adminSecretQuery = url.searchParams.get('adminSecret');
  if ((adminSecretHeader ?? adminSecretQuery) !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const intents = await intentService.listIntents();
  return NextResponse.json(intents);
}
