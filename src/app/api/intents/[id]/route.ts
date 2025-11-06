import { NextResponse } from 'next/server';
import { intentService } from '@/server/services/intentService';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminSecret = req.headers.get('x-admin-secret');

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json();
  const action = body?.action as 'approve' | 'reject';

  try {
    const result = await intentService.processIntent(+id, action);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) return NextResponse.json({ error: 'id param required' }, { status: 400 });

  try {
    const intent = await intentService.getIntentById(+id);
    return NextResponse.json(intent);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
