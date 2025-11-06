// src/app/api/invites/register/route.ts
import { NextResponse } from 'next/server';
import { inviteService } from '@/server/services/inviteService';

export async function POST(req: Request) {
  const body = await req.json();
  const { token, name, email, company } = body ?? {};
  if (!token || !name || !email) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  try {
    const member = await inviteService.registerMember(token, { name, email, company });
    return NextResponse.json({ ok: true, member }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
