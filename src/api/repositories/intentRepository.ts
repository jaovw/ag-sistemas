import { prisma } from '@/lib/prisma';

export const intentRepository = {
  create: async (data: any) => prisma.membershipIntent.create({ data }),
  findAll: async () => prisma.membershipIntent.findMany({ orderBy: { createdAt: 'desc' } }),
  findById: async (id: number) => prisma.membershipIntent.findUnique({ where: { id } }),
  update: async (id: number, data: any) => prisma.membershipIntent.update({ where: { id }, data }),
};
