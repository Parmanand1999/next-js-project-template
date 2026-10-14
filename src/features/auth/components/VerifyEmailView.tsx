'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyEmailApi } from '@/services/authService';

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const [message, setMessage] = useState<string>(
    token ? '' : 'Invalid or missing verification link.'
  );
  const [isError, setIsError] = useState<boolean>(!token);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const runVerification = async () => {
      try {
        const res = await verifyEmailApi(token);
        if (isMounted) {
          setMessage(res?.data?.message || 'Email verified successfully!');
          toast.success('Email verified successfully');
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsError(true);
          const errMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          setMessage(errMessage || 'Invalid or expired verification link');
          toast.error('Email verification failed');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="size-12 mx-auto rounded-xl bg-[#3456A7] text-[#FFE8A3] flex items-center justify-center text-sm font-black shadow-md">
          TTS
        </div>
        <h1 className="mt-2 text-base font-bold text-[#0B1F3A] tracking-wider uppercase">
          Travel Tech Services
        </h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
          Enterprise Email Verification
        </p>
      </div>

      {/* Verification Card */}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center space-y-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="size-12 animate-spin text-[#3456A7]" />
            <p className="text-sm font-medium text-slate-700">Verifying your email token...</p>
          </div>
        ) : (
          <>
            <div
              className={`mx-auto flex items-center justify-center rounded-full size-16 ${
                isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {isError ? (
                <XCircle className="size-8" />
              ) : (
                <CheckCircle2 className="size-8" />
              )}
            </div>

            <h3
              className={`text-base font-bold ${
                isError ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {isError ? 'Verification Failed' : 'Verification Successful'}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-normal px-2">
              {message}
            </p>

            <Button
              onClick={() => router.push('/login')}
              className="w-full mt-4 bg-[#3456A7] hover:bg-[#284485] text-white"
            >
              Proceed to Sign In
            </Button>
          </>
        )}
      </div>

      <p className="text-[10px] text-slate-400 mt-6 text-center max-w-xs leading-relaxed uppercase tracking-wider">
        Authorized Access Only. All activities are monitored and logged for security compliance.
      </p>
    </div>
  );
}
