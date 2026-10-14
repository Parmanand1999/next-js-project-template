'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyEmailApi } from '@/services/authService';

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const [message, setMessage] = useState<string>(
    token ? '' : 'Invalid or missing email verification link.'
  );
  const [isError, setIsError] = useState<boolean>(!token);
  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const runVerification = async () => {
      try {
        const res = await verifyEmailApi(token);
        if (isMounted) {
          setMessage(res?.data?.message || 'Corporate email address successfully verified!');
          setIsError(false);
          toast.success('Email verified successfully');
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsError(true);
          const errMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          setMessage(errMessage || 'Verification token is invalid or has expired.');
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

  // Auto redirect on success
  useEffect(() => {
    if (!loading && !isError) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, isError, router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-between p-6 sm:p-10">
      {/* Top Brand Logo */}
      <div className="flex items-center gap-2.5 pt-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#3456A7] text-[#FFE8A3] shadow-md">
          <Globe className="size-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-2xl text-[#3456A7] leading-none">
            TTS
          </span>
          <span className="text-[10px] font-black text-[#3456A7] uppercase tracking-wider mt-0.5">
            RECOVER EVERY PENNY
          </span>
        </div>
      </div>

      {/* Verification Card */}
      <div className="bg-[#3456A7] w-full max-w-md rounded-3xl shadow-2xl border border-blue-400/30 p-8 sm:p-10 text-center text-white my-auto relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-[#FFE8A3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">
                VERIFYING EMAIL...
              </h3>
              <p className="text-xs text-blue-100/80 font-normal">
                Connecting to corporate identity service to validate your token.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`mx-auto flex items-center justify-center rounded-full size-20 shadow-lg ${
                isError
                  ? 'bg-rose-500/20 text-rose-300 border-2 border-rose-400'
                  : 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400'
              }`}
            >
              {isError ? (
                <XCircle className="size-10" />
              ) : (
                <CheckCircle2 className="size-10" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-white">
                {isError ? 'VERIFICATION FAILED' : 'EMAIL VERIFIED!'}
              </h3>
              <p className="text-xs text-blue-100/90 leading-relaxed font-normal px-2">
                {message}
              </p>
            </div>

            {!isError && (
              <p className="text-xs text-blue-200/80 font-mono">
                Redirecting to Sign In in {countdown}s...
              </p>
            )}

            <Button
              onClick={() => router.push('/login')}
              className="w-full h-11 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-lg transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span>{isError ? 'Return to Sign In' : 'Proceed to Sign In'}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Footer Notice */}
      <div className="text-center text-[11px] text-slate-400 max-w-sm pb-2">
        Travel Tech Services Enterprise Security • Authorized Personnel Only
      </div>
    </div>
  );
}

export default VerifyEmailView;
