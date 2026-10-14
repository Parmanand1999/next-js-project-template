import useAuthStore from '@/store/useAuthStore';

export const logoutUser = () => {
  const logout = useAuthStore.getState().logout;
  logout();

  if (typeof window !== 'undefined') {
    localStorage.clear();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }
};
