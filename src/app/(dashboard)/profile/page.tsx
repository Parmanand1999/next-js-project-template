import { Metadata } from 'next';
import { ProfileView } from '@/features/profile';

export const metadata: Metadata = {
  title: 'Profile | Enterprise Portal',
  description: 'Manage personal credentials, contact details, and account security.',
};

export default function ProfilePage() {
  return <ProfileView />;
}
