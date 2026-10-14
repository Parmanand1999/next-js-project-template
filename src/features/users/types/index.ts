import { Role } from '@/config/roles';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended' | 'pending';
  joinedAt: string;
}
