export type IntentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MembershipIntent {
  id: number;
  name: string;
  email: string;
  company?: string | null;
  message?: string | null;
  status: IntentStatus;
  createdAt: string;
  processedAt?: string | null;
  processedBy?: string | null;
  inviteId?: number | null;
}

export interface Invite {
  id: number;
  token: string;
  intentId: number;
  used: boolean;
  createdAt: string;
  intent?: MembershipIntent | null;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  company?: string | null;
  createdAt: string;
}
