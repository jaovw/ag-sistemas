import { prisma } from '@/lib/prisma';

export const inviteRepository = {
  create: async (intentId: number, token: string) =>
    prisma.invite.create({ data: { token, intentId } }),

  findByToken: async (token: string) =>
    prisma.invite.findUnique({ where: { token }, include: { intent: true } }),

  markUsed: async (id: number) =>
    prisma.invite.update({ where: { id }, data: { used: true } }),
};
