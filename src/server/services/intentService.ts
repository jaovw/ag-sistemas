import { intentRepository } from '@/server/repositories/intentRepository';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CreateIntentDTO } from '@/types/dto';
import { Invite } from '@/types/entities';
import { v4 as uuidv4 } from 'uuid';

export const intentService = {
  async createIntent(data: CreateIntentDTO) {
    return intentRepository.create({ ...data });
  },

  async listIntents() {
    return intentRepository.findAll();
  },

  async getIntentById(id: number) {
    const intent = await intentRepository.findById(id);
    if (!intent) throw new Error('Intent not found');
    return intent;
  },

  async processIntent(id: number, action: 'approve' | 'reject'): Promise<Invite | { status: string }> {
    const intent = await intentRepository.findById(id);
    if (!intent) throw new Error('Intent not found');

    if (action === 'reject') {
      const updated = await intentRepository.update(id, {
        status: 'REJECTED',
        processedAt: new Date().toISOString(),
      });
      return { status: updated.status };
    }

    const token = uuidv4();
    const invite = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdInvite = await tx.invite.create({
        data: { token, intentId: id },
      });
      await tx.membershipIntent.update({
        where: { id },
        data: { status: 'APPROVED', processedAt: new Date().toISOString() },
      });
      return createdInvite;
    });

    const result: Invite = {
      id: invite.id,
      token: invite.token,
      intentId: invite.intentId,
      used: invite.used,
      createdAt: invite.createdAt.toISOString(),
    };

    console.log(`[Invite] Register link: /register/${result.token}`);
    return result;
  },
};
