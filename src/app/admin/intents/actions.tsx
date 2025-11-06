'use server';
import { intentService } from '@/server/services/intentService';
import { revalidatePath } from 'next/cache';

export async function approveIntentAction(formData: FormData) {
  const idRaw = formData.get('id');
  const adminSecret = formData.get('adminSecret') as string | null;
  if (String(adminSecret) !== process.env.ADMIN_SECRET) throw new Error('Unauthorized');

  const id = Number(idRaw);
  if (Number.isNaN(id)) throw new Error('Invalid id');

  await intentService.processIntent(id, 'approve');

  revalidatePath('/admin/intents');
}

export async function rejectIntentAction(formData: FormData) {
  const idRaw = formData.get('id');
  const adminSecret = formData.get('adminSecret') as string | null;
  if (String(adminSecret) !== process.env.ADMIN_SECRET) throw new Error('Unauthorized');

  const id = Number(idRaw);
  if (Number.isNaN(id)) throw new Error('Invalid id');

  await intentService.processIntent(id, 'reject');

  revalidatePath('/admin/intents');
}
