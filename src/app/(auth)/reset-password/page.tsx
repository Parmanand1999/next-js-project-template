import React, { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth';

export const metadata = {
  title: 'Reset Password | Enterprise Portal',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="size-8 rounded-full border-2 border-[#3456A7] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
