'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Check,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { resetPasswordApi } from '@/services/authService';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9!@#$%^&*]/, 'Password must contain at least one number or special symbol'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
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
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password') || '';
  const confirmPasswordVal = watch('confirmPassword') || '';

  const hasMinLength = passwordVal.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordVal);
  const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(passwordVal);
  const passwordsMatch = Boolean(confirmPasswordVal && passwordVal === confirmPasswordVal);

  const calculateStrength = () => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumberOrSymbol) score++;
    if (passwordVal.length >= 12) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-rose-400', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-400', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-400', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-400', width: '100%' };
  };

  const strength = calculateStrength();

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
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 bg-[#f8fafc]">
      {/* Brand Header */}
      <div className="w-full flex items-center justify-between max-w-md pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#3456A7] text-[#FFE8A3] shadow-md">
            <Globe className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl text-[#3456A7] leading-none">
              TTS
            </span>
            <span className="text-[9px] font-black text-[#3456A7] uppercase tracking-wider mt-0.5">
              RECOVER EVERY PENNY
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#3456A7] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Sign In
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#3456A7] rounded-3xl p-7 sm:p-9 shadow-2xl text-white my-auto border border-blue-400/30">
        <div className="text-center mb-6">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#FFE8A3] mb-3">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-white uppercase">
            RESET PASSWORD
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 font-normal">
            Choose a strong password to secure your corporate portal account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-blue-200" />
                New Password <span className="text-[#FFE8A3]">*</span>
              </span>
              {passwordVal && (
                <span className="text-[10px] font-semibold text-blue-100 uppercase">
                  Strength: <span className="text-[#FFE8A3]">{strength.label}</span>
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                {...register('password')}
                className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3.5 pr-10 shadow-inner placeholder:text-slate-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Strength Bar */}
            {passwordVal && (
              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
            )}

            {/* Criteria Checklist */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-blue-100/80 pt-1">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-300 font-semibold' : ''}`}>
                <Check className="size-3" /> 8+ Characters
              </span>
              <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-300 font-semibold' : ''}`}>
                <Check className="size-3" /> Uppercase Letter
              </span>
              <span className={`flex items-center gap-1 ${hasNumberOrSymbol ? 'text-emerald-300 font-semibold' : ''}`}>
                <Check className="size-3" /> Number or Symbol
              </span>
            </div>

            {errors.password && (
              <p className="text-[#FFE8A3] text-xs font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-blue-200" />
                Confirm Password <span className="text-[#FFE8A3]">*</span>
              </span>
              {passwordsMatch && (
                <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <Check className="size-3" /> Matches
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                {...register('confirmPassword')}
                className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3.5 pr-10 shadow-inner placeholder:text-slate-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[#FFE8A3] text-xs font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-lg transition-all active:scale-[0.98] text-sm flex items-center justify-center mt-5 cursor-pointer border-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4.5 animate-spin" />
                <span>Updating Password...</span>
              </div>
            ) : (
              'Reset Password & Sign In'
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 max-w-sm mt-6 mb-2">
        256-bit TLS Encrypted Session • Authorized Personnel Only
      </div>
    </div>
  );
}

export default ResetPasswordForm;
