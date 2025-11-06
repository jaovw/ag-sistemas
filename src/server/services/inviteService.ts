import { Prisma } from '@prisma/client';
import { inviteRepository } from '../repositories/inviteRepository';
import { prisma } from '@/lib/prisma';

export const inviteService = {
  async validateToken(token: string) {
    const invite = await inviteRepository.findByToken(token);
    if (!invite || invite.used) throw new Error('Invalid or used token');
    return invite.intent;
  },

  async registerMember(token: string, data: any) {
    const invite = await inviteRepository.findByToken(token);
    if (!invite || invite.used) throw new Error('Invalid token');

    const member = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newMember = await tx.member.create({ data });
      await tx.invite.update({ where: { id: invite.id }, data: { used: true } });
      return newMember;
    });

    return member;
  },
};
