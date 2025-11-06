export interface CreateIntentDTO {
  name: string;
  email: string;
  company?: string;
  message?: string;
}

export interface ProcessIntentDTO {
  action: 'approve' | 'reject';
}

export interface CreateInviteDTO {
  intentId: number;
  token: string;
  expiresAt?: string;
}

export interface RegisterMemberDTO {
  token: string;
  name: string;
  email: string;
  company?: string;
}
