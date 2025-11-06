import { prisma } from '@/lib/prisma';
import { MembershipIntent } from '@/types/entities';

export const intentRepository = {
  create: async (data: Omit<MembershipIntent, 'id' | 'createdAt' | 'status'>): Promise<MembershipIntent> =>
    prisma.membershipIntent.create({ data }) as Promise<MembershipIntent>,

  findAll: async (): Promise<MembershipIntent[]> =>
    prisma.membershipIntent.findMany({ orderBy: { createdAt: 'desc' } }) as Promise<MembershipIntent[]>,

  findById: async (id: number): Promise<MembershipIntent | null> =>
    prisma.membershipIntent.findUnique({ where: { id } }) as Promise<MembershipIntent | null>,

  update: async (id: number, data: Partial<MembershipIntent>): Promise<MembershipIntent> =>
    prisma.membershipIntent.update({ where: { id }, data }) as Promise<MembershipIntent>,
};
