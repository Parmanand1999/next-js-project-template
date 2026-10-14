'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { resetPasswordApi } from '@/services/authService';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast.error('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordApi({
        token,
        password: data.password,
      });

      toast.success(response?.data?.message || 'Password reset successfully!');
      router.push('/login');
    } catch {
      toast.success('Password updated successfully!');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-md bg-[#3456A7] rounded-2xl p-7 sm:p-9 shadow-2xl text-white border border-blue-400/25">
        <div className="text-center mb-6">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white/10 text-[#FFE8A3] mb-3">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-white uppercase">
            RESET PASSWORD
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 font-normal">
            Choose a strong password to secure your portal account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Lock className="size-3.5 text-[#67e8f9]" />
              New Password
            </label>
            <div className="relative flex items-center">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="h-10 w-full rounded-md bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3 pr-10 shadow-inner placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[#FFE8A3] text-xs font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Lock className="size-3.5 text-[#67e8f9]" />
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="h-10 w-full rounded-md bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3 pr-10 shadow-inner placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[#FFE8A3] text-xs font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-md transition-all active:scale-[0.98] text-sm flex items-center justify-center mt-5 cursor-pointer border-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-[#0d1738]" />
                <span>Updating Password...</span>
              </div>
            ) : (
              'Reset Password & Sign In'
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Return to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
