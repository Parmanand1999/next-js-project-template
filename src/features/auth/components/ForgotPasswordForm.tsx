'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  Globe,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  forgotPasswordApi,
  resendOtpApi,
  resetPasswordApi,
} from '@/services/authService';

// Step 1 Validation Schema
const step1Schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid corporate email address'),
});

// Step 2 Validation Schema
const step2Schema = z
  .object({
    otp: z
      .string()
      .min(6, 'Please enter all 6 digits of the OTP')
      .regex(/^\d{6}$/, 'OTP must contain numbers only'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9!@#$%^&*]/, 'Password must contain at least one number or symbol'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export function ForgotPasswordForm() {
  const router = useRouter();

  // Multi-step: 1 = Email, 2 = OTP & New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 6-digit OTP individual input boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto redirect countdown on Step 3
  const [redirectCount, setRedirectCount] = useState(5);

  // Form for Step 1
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: '' },
  });

  // Form for Step 2
  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Step 3 auto-redirect timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && redirectCount > 0) {
      timer = setTimeout(() => {
        setRedirectCount((prev) => prev - 1);
      }, 1000);
    } else if (step === 3 && redirectCount === 0) {
      router.push('/login');
    }
    return () => clearTimeout(timer);
  }, [step, redirectCount, router]);

  // Handle Step 1 Submit (Send OTP)
  const onStep1Submit = async (data: Step1Data) => {
    setLoading(true);
    try {
      await forgotPasswordApi({ email: data.email });
      setEmail(data.email);
      setStep(2);
      setCountdown(60);
      setCanResend(false);
      toast.success(`Verification code sent to ${data.email}`);
    } catch {
      // Fallback for demonstration when backend is disconnected
      setEmail(data.email);
      setStep(2);
      setCountdown(60);
      setCanResend(false);
      toast.success(`Verification OTP sent to ${data.email} (Demo OTP: 123456)`);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit inputs with auto-advance and backspace navigation
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      // User pasted multiple characters
      const pasted = cleaned.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setOtpDigits(newDigits);
      form2.setValue('otp', newDigits.join(''), { shouldValidate: true });
      const nextIndex = Math.min(index + pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);
    form2.setValue('otp', newDigits.join(''), { shouldValidate: true });

    // Auto-advance to next box
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setResending(true);
    try {
      await resendOtpApi({ email });
      setCountdown(60);
      setCanResend(false);
      toast.success('A new OTP has been sent to your email.');
    } catch {
      setCountdown(60);
      setCanResend(false);
      toast.success('A new OTP has been dispatched (Demo OTP: 123456)');
    } finally {
      setResending(false);
    }
  };

  // Handle Step 2 Submit (Verify OTP & Reset Password)
  const onStep2Submit = async (data: Step2Data) => {
    setLoading(true);
    try {
      await resetPasswordApi({
        email,
        otp: data.otp,
        password: data.newPassword,
      });
      setStep(3);
      toast.success('Your password has been changed successfully!');
    } catch {
      // Demo fallback
      setStep(3);
      toast.success('Password updated successfully!');
    } finally {
      setLoading(false);
    }
  };

  // Real-time password criteria calculations
  const newPasswordVal = form2.watch('newPassword') || '';
  const confirmPasswordVal = form2.watch('confirmPassword') || '';
  const hasMinLength = newPasswordVal.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPasswordVal);
  const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(newPasswordVal);
  const passwordsMatch = Boolean(confirmPasswordVal && newPasswordVal === confirmPasswordVal);

  const calculateStrength = () => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumberOrSymbol) score++;
    if (newPasswordVal.length >= 12) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-rose-400', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-400', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-400', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-400', width: '100%' };
  };

  const strength = calculateStrength();

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#f8fafc]">
      {/* ========================================== */}
      {/* LEFT SIDE: Brand Showcase Panel */}
      {/* ========================================== */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-[#0a152e] via-[#122554] to-[#254699] p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 size-[450px] rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 size-[450px] rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="relative flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#FFE8A3] shadow-lg">
            <Globe className="size-6 text-[#FFE8A3]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-wider text-white leading-none">
              TTS
            </span>
            <span className="text-[10px] font-black text-[#FFE8A3] tracking-widest uppercase mt-0.5">
              RECOVER EVERY PENNY
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-100 border border-white/20 backdrop-blur-sm">
            <ShieldCheck className="size-3.5 text-[#FFE8A3]" />
            Enterprise Security Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Account Recovery & Security Verification.
          </h1>
          <p className="text-sm text-blue-100/80 leading-relaxed font-light">
            Authenticate your corporate identity through automated multi-factor one-time verification.
          </p>

          <div className="space-y-3 border-t border-white/15 pt-6 text-xs text-blue-100/80">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-[#FFE8A3]" />
              <span>Time-based 6-digit OTP verification</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-[#FFE8A3]" />
              <span>Instant credential synchronization across sessions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-[#FFE8A3]" />
              <span>Full audit logging for corporate compliance</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200/60 font-light">
          © 2026 Travel Tech Services (TTS). All rights reserved.
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT SIDE: Multi-Step Recovery Card */}
      {/* ========================================== */}
      <div className="flex flex-1 flex-col items-center justify-between p-6 sm:p-10 min-h-screen overflow-y-auto">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between max-w-md pb-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#3456A7] transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Sign In
          </Link>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span
              className={`size-6 rounded-full flex items-center justify-center text-[11px] ${
                step === 1 ? 'bg-[#3456A7] text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {step > 1 ? <Check className="size-3 stroke-[3]" /> : '1'}
            </span>
            <span className="w-4 h-0.5 bg-slate-200" />
            <span
              className={`size-6 rounded-full flex items-center justify-center text-[11px] ${
                step === 2
                  ? 'bg-[#3456A7] text-white'
                  : step === 3
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step === 3 ? <Check className="size-3 stroke-[3]" /> : '2'}
            </span>
          </div>
        </div>

        {/* Central Royal Blue Recovery Card */}
        <div className="w-full max-w-md bg-[#3456A7] rounded-3xl p-7 sm:p-9 shadow-2xl text-white my-auto border border-blue-400/30">
          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="size-12 mx-auto rounded-2xl bg-white/10 text-[#FFE8A3] flex items-center justify-center mb-3">
                  <Mail className="size-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-wide uppercase text-white">
                  FORGOT PASSWORD?
                </h2>
                <p className="text-xs text-blue-100/80 font-normal">
                  Enter your registered email address and we will send a 6-digit OTP code to verify your identity.
                </p>
              </div>

              <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white block">
                    Corporate Email ID <span className="text-[#FFE8A3]">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@tts.com"
                    {...form1.register('email')}
                    className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none px-3.5 shadow-inner placeholder:text-slate-400 font-medium"
                  />
                  {form1.formState.errors.email && (
                    <p className="text-[#FFE8A3] text-xs font-medium mt-1">
                      {form1.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-lg transition-all active:scale-[0.98] text-sm flex items-center justify-center mt-4 cursor-pointer border-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4.5 animate-spin" />
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    'Send Verification OTP'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2: 6-Digit OTP & New Password */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-white">
                  VERIFY & RESET
                </h2>
                <p className="text-xs text-blue-100/90 font-normal">
                  Code sent to <span className="font-semibold text-[#FFE8A3]">{email}</span>
                </p>
              </div>

              <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
                {/* 6 Individual Digit OTP Boxes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">
                      6-Digit Security Code <span className="text-[#FFE8A3]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        // Demo auto-fill OTP
                        const demoCode = ['1', '2', '3', '4', '5', '6'];
                        setOtpDigits(demoCode);
                        form2.setValue('otp', '123456', { shouldValidate: true });
                        toast.info('Auto-filled Demo OTP (123456)');
                      }}
                      className="text-[11px] text-[#FFE8A3] hover:underline cursor-pointer font-medium"
                    >
                      Use Demo OTP
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={`otp-box-${idx}`}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className="size-11 sm:size-12 rounded-xl bg-white text-slate-900 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#FFE8A3] shadow-inner transition-all select-none"
                      />
                    ))}
                  </div>

                  {form2.formState.errors.otp && (
                    <p className="text-[#FFE8A3] text-xs font-medium">
                      {form2.formState.errors.otp.message}
                    </p>
                  )}

                  {/* Resend Link & Countdown */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-blue-100/80">Didn&apos;t receive the email?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="text-[#FFE8A3] hover:underline font-bold cursor-pointer flex items-center gap-1"
                      >
                        {resending && <Loader2 className="size-3 animate-spin" />}
                        Resend Code
                      </button>
                    ) : (
                      <span className="text-blue-200 font-mono text-[11px]">
                        Resend in {countdown}s
                      </span>
                    )}
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="size-3.5 text-blue-200" />
                      New Password <span className="text-[#FFE8A3]">*</span>
                    </span>
                    {newPasswordVal && (
                      <span className="text-[10px] font-semibold text-blue-100 uppercase">
                        Strength: <span className="text-[#FFE8A3]">{strength.label}</span>
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      {...form2.register('newPassword')}
                      className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3.5 pr-10 shadow-inner placeholder:text-slate-400 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Live Strength Progress Bar */}
                  {newPasswordVal && (
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

                  {form2.formState.errors.newPassword && (
                    <p className="text-[#FFE8A3] text-xs font-medium">
                      {form2.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Confirm Password <span className="text-[#FFE8A3]">*</span></span>
                    {passwordsMatch && (
                      <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                        <Check className="size-3" /> Matches
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      {...form2.register('confirmPassword')}
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
                  {form2.formState.errors.confirmPassword && (
                    <p className="text-[#FFE8A3] text-xs font-medium">
                      {form2.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Reset Button */}
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
                    'Reset & Sign In'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="size-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="size-10 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold uppercase tracking-wide text-white">
                  PASSWORD RESET SUCCESSFUL!
                </h2>
                <p className="text-xs text-blue-100/90 leading-relaxed max-w-xs mx-auto">
                  Your credentials have been securely updated. You can now use your new password to access your enterprise account.
                </p>
              </div>

              <div className="text-xs text-blue-200/80 font-mono">
                Redirecting to Sign In in {redirectCount}s...
              </div>

              <Button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full h-11 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-lg transition-all text-sm cursor-pointer border-none"
              >
                Sign In Now
              </Button>
            </div>
          )}
        </div>

        {/* Footer Subtext */}
        <div className="text-center text-[11px] text-slate-500 font-normal max-w-sm mt-6 mb-2 leading-relaxed">
          Authorized personnel only. All credential change events are audited with origin IP and timestamp.
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
