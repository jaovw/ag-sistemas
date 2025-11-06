'use server';
import { intentService } from '@/server/services/intentService';
import { revalidatePath } from 'next/cache';

export async function createIntentAction(formData: FormData) {
  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const company = formData.get('company') ? String(formData.get('company')!) : undefined;
  const message = formData.get('message') ? String(formData.get('message')!) : undefined;

  if (!name || !email) {
    throw new Error('Nome e e-mail são obrigatórios');
  }

  await intentService.createIntent({ name, email, company, message });
  revalidatePath('/admin/intents');
}
