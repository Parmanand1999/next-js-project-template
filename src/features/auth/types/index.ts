import { Role } from '@/config/roles';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  role: Role;
}
