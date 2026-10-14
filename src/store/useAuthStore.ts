import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMeApi } from '@/services/authService';
import { AuthState, LoginResponseData, UserProfile } from '@/types/auth';

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      permissions: [],
      isSuperAdmin: false,
      role: null,
      loadingUser: false,

      login: (data: LoginResponseData) => {
        const user = data.userDetails || data.user || null;
        const accessToken = data.accessToken || null;
        const refreshToken = data.refreshToken || null;

        // Sync role cookie for Next.js edge proxy/middleware
        if (typeof document !== 'undefined') {
          const roleName = user?.isSuperAdmin ? 'SUPER_ADMIN' : (user?.roleName?.toUpperCase() || 'USER');
          document.cookie = `user_role=${roleName}; path=/; max-age=86400; SameSite=Lax`;
          if (accessToken) {
            document.cookie = `session=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
          }
        }

        set({
          user,
          accessToken,
          refreshToken,
          isSuperAdmin: Boolean(user?.isSuperAdmin),
          role: user?.role || user?.roleName || null,
          permissions: user?.permissions || [],
        });

        // Fetch fresh profile and permissions if token is provided
        if (accessToken) {
          get().fetchCurrentUser();
        }
      },

      setUserDetails: (userData: UserProfile | null) => {
        if (!userData) return;

        const roleObj = typeof userData.role === 'object' ? userData.role : null;
        const roleName = roleObj?.name || userData.roleName || (typeof userData.role === 'string' ? userData.role : 'User');
        const isSuperAdmin = Boolean(userData.isSuperAdmin || userData.is_super_admin || roleObj?.isSuperAdmin);

        if (typeof document !== 'undefined') {
          const cookieRole = isSuperAdmin ? 'SUPER_ADMIN' : roleName.toUpperCase();
          document.cookie = `user_role=${cookieRole}; path=/; max-age=86400; SameSite=Lax`;
        }

        set({
          user: {
            userId: userData.userId || userData.id,
            id: userData.id || userData.userId,
            name: userData.name,
            email: userData.email,
            contactNumber: userData.contactNumber,
            avatar: userData.avatar,
            isSuperAdmin,
            role: userData.role || null,
            refundType: userData.refundType || [],
            roleName,
          },
          permissions: Array.isArray(userData.permissions) ? userData.permissions : [],
          isSuperAdmin,
          role: userData.role || null,
        });
      },

      fetchCurrentUser: async () => {
        const token = get().accessToken;
        if (!token) return null;

        set({ loadingUser: true });
        try {
          const res = await getMeApi();
          const meData = (res?.data as { data?: UserProfile })?.data || (res?.data as UserProfile);
          if (meData) {
            get().setUserDetails(meData);
          }
          return meData || null;
        } catch (error) {
          console.error('Failed to fetch current user profile:', error);
          return null;
        } finally {
          set({ loadingUser: false });
        }
      },

      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'user_role=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'session=; path=/; max-age=0; SameSite=Lax';
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          permissions: [],
          isSuperAdmin: false,
          role: null,
          loadingUser: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
