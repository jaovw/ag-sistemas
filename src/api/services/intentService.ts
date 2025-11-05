import { intentRepository } from '../repositories/intentRepository';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const intentService = {
  async createIntent(data: any) {
    return await intentRepository.create({ ...data });
  },

  async listIntents() {
    return await intentRepository.findAll();
  },

  async processIntent(id: number, action: 'approve' | 'reject') {
    const intent = await intentRepository.findById(id);
    if (!intent) throw new Error('Intent not found');

    if (action === 'reject') {
      return await intentRepository.update(id, {
        status: 'REJECTED',
        processedAt: new Date(),
      });
    }

		// [joaovictor - 05/11/2025] Aprovação e criação de token
    const token = uuidv4();
    const invite = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const invite = await tx.invite.create({ data: { token, intentId: id } });
      await tx.membershipIntent.update({
        where: { id },
        data: { status: 'APPROVED', processedAt: new Date() },
      });
      return invite;
    });

    console.log(`[Invite] Register link: /register/${invite.token}`);
    return invite;
  },
};
