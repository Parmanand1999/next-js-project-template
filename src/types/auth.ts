export interface UserRole {
  id?: string;
  name: string;
  isSuperAdmin?: boolean;
}

export interface UserProfile {
  userId?: string;
  id?: string;
  name: string;
  email: string;
  contactNumber?: string;
  avatar?: string;
  isSuperAdmin?: boolean;
  is_super_admin?: boolean;
  role?: UserRole | string | null;
  roleName?: string;
  refundType?: string[];
  permissions?: string[];
}

export interface LoginResponseData {
  userDetails?: UserProfile;
  user?: UserProfile;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: string[];
  isSuperAdmin: boolean;
  role: UserRole | string | null;
  loadingUser: boolean;

  login: (data: LoginResponseData) => void;
  setUserDetails: (userData: UserProfile | null) => void;
  fetchCurrentUser: () => Promise<UserProfile | null>;
  logout: () => void;
}
