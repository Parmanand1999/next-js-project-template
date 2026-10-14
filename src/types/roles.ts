export * from '@/config/roles';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: import('@/config/roles').Role;
  avatarUrl?: string;
}
