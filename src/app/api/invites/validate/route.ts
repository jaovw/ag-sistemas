import { NextResponse } from 'next/server';
import { inviteService } from '@/server/services/inviteService';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) return NextResponse.json({ ok: false, error: 'token required' }, { status: 400 });

  try {
    const intent = await inviteService.validateToken(token);
    return NextResponse.json({ ok: true, intent });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
