'use client';

import React, { useState } from 'react';
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
  Globe,
  Loader2,
  CheckCircle2,
  Layers,
  Plane,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { signupApi, SignupPayload } from '@/services/authService';
import useAuthStore from '@/store/useAuthStore';

// Validation Schema
const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full Name must be at least 2 characters')
      .max(60, 'Full Name cannot exceed 60 characters'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid corporate or personal email address'),
    mobile: z
      .string()
      .min(10, 'Mobile number must be at least 10 digits')
      .regex(/^[0-9+ -]{10,15}$/, 'Please enter a valid phone number'),
    role: z.string().min(1, 'Role is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      role: 'user',
      password: '',
      confirmPassword: '',
      agreeTerms: true,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);

    const payload: SignupPayload = {
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      mobile: data.mobile.trim(),
      role: data.role || 'user',
    };

    try {
      const response = await signupApi(payload);
      const resData = response?.data;

      toast.success(resData?.message || 'Account created successfully!');
      setIsSuccess(true);

      // Show success screen and redirect to login after short delay
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(data.email.trim())}`);
      }, 2000);
    } catch (apiError: unknown) {
      const errResponse = (apiError as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      const errorMessage =
        errResponse?.message ||
        errResponse?.error ||
        'Failed to register account. Please check your details and try again.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-Fill using exact request parameters
  const handleQuickFill = () => {
    setValue('fullName', 'Test User', { shouldValidate: true });
    // Generating a unique email handle option or base test email
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setValue('email', `test${randomSuffix}@example.com`, { shouldValidate: true });
    setValue('mobile', '9876543210', { shouldValidate: true });
    setValue('password', 'secret123', { shouldValidate: true });
    setValue('confirmPassword', 'secret123', { shouldValidate: true });
    setValue('role', 'user', { shouldValidate: true });
    setValue('agreeTerms', true, { shouldValidate: true });
    toast.info('Filled sample credentials (Test User / secret123)');
  };

  const handleKeyDownPassword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#f8fafc]">
      {/* ========================================== */}
      {/* LEFT SIDE: Enterprise Airline Showcase Panel */}
      {/* ========================================== */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-[#0a152e] via-[#122554] to-[#254699] p-12 text-white overflow-hidden">
        {/* Decorative Ambient Lighting */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 size-[450px] rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 size-[450px] rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="relative flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#FFE8A3] shadow-lg">
            <Globe className="size-6 text-[#FFE8A3]" />
            <div className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-400 border-2 border-[#122554]" />
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

        {/* Center Marketing Copy & Capabilities */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto py-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-100 border border-white/20 backdrop-blur-sm">
              <Plane className="size-3.5 text-[#FFE8A3]" />
              Enterprise Airline Refund Engine
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.15]">
              Get Started with Next-Gen Ticket Recovery.
            </h1>
            <p className="text-sm text-blue-100/80 leading-relaxed font-light">
              Create an enterprise account to access automated fare auditing, waiver parsing, and direct GDS integrations.
            </p>
          </div>

          <div className="space-y-4 border-t border-white/15 pt-6">
            <div className="flex items-start gap-3">
              <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center text-[#FFE8A3] shrink-0 mt-0.5">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#FFE8A3] leading-tight">
                  Instant Automated Onboarding
                </h4>
                <p className="text-xs text-blue-100/70 mt-0.5 leading-relaxed">
                  Connect your agency or airline credentials to begin processing claims in minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center text-[#FFE8A3] shrink-0 mt-0.5">
                <Layers className="size-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#FFE8A3] leading-tight">
                  Multi-Role Access Control
                </h4>
                <p className="text-xs text-blue-100/70 mt-0.5 leading-relaxed">
                  Custom access permissions for Administrators, Claims Managers, and Portal Users.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center text-[#FFE8A3] shrink-0 mt-0.5">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#FFE8A3] leading-tight">
                  Bank-Grade Data Compliance
                </h4>
                <p className="text-xs text-blue-100/70 mt-0.5 leading-relaxed">
                  End-to-end encryption for payment details, PNR data, and passenger records.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Subtext */}
        <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/60 font-light border-t border-white/10 pt-4">
          <span>© 2026 Travel Tech Services (TTS)</span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" />
            Core API Cluster: 99.98% Live
          </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT SIDE: Interactive Sign Up Card */}
      {/* ========================================== */}
      <div className="flex flex-1 flex-col items-center justify-between p-6 sm:p-10 min-h-screen overflow-y-auto">
        {/* Top Header Logo on Right */}
        <div className="w-full flex items-center justify-between max-w-lg pb-2">
          {/* Logo Badge */}
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

          {/* Quick Demo Pill */}
          <button
            type="button"
            onClick={handleQuickFill}
            className="flex items-center gap-1.5 bg-slate-200/80 hover:bg-white text-slate-700 hover:text-[#3456A7] px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer border border-slate-300/60"
            title="Auto-fill sample test data"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Fill Test Data</span>
          </button>
        </div>

        {/* Royal Blue Sign-Up Card (#3456A7) */}
        <div className="w-full max-w-lg bg-[#3456A7] rounded-3xl p-7 sm:p-9 shadow-2xl text-white my-auto border border-blue-400/30 relative">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white uppercase">
              CREATE ACCOUNT
            </h2>
            <p className="text-xs text-blue-100/90 mt-1 font-normal">
              Enter your details to register for the platform
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center space-y-4">
              <div className="size-14 rounded-full bg-emerald-500/20 text-[#FFE8A3] flex items-center justify-center mx-auto border border-emerald-400/30">
                <CheckCircle2 className="size-8 text-[#FFE8A3]" />
              </div>
              <h3 className="text-lg font-bold text-white">Registration Successful!</h3>
              <p className="text-xs text-blue-100/80 max-w-xs mx-auto">
                Your account has been created. Redirecting you to sign in...
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFE8A3] text-[#0d1738] font-bold text-xs hover:bg-[#ffd970] transition-all"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <User className="size-3.5 text-blue-200" />
                  Full Name <span className="text-[#FFE8A3]">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Test User"
                    {...register('fullName')}
                    className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none px-3.5 shadow-inner placeholder:text-slate-400 font-medium"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[#FFE8A3] text-xs font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Grid: Email & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Mail className="size-3.5 text-blue-200" />
                    Email ID <span className="text-[#FFE8A3]">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="test@example.com"
                      {...register('email')}
                      className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none px-3.5 shadow-inner placeholder:text-slate-400 font-medium"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[#FFE8A3] text-xs font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Mobile Number Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Phone className="size-3.5 text-blue-200" />
                    Mobile Number <span className="text-[#FFE8A3]">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      {...register('mobile')}
                      className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none px-3.5 shadow-inner placeholder:text-slate-400 font-medium"
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-[#FFE8A3] text-xs font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3" />
                      {errors.mobile.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Selection (Pill Badges) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-blue-200" />
                    Account Role
                  </span>
                  <span className="text-[10px] text-blue-200/80 font-normal">Select role type</span>
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-blue-900/40 rounded-xl border border-blue-400/20">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'user')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'user'
                        ? 'bg-[#FFE8A3] text-[#0d1738] shadow-sm font-bold'
                        : 'text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'manager')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'manager'
                        ? 'bg-[#FFE8A3] text-[#0d1738] shadow-sm font-bold'
                        : 'text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'admin')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-[#FFE8A3] text-[#0d1738] shadow-sm font-bold'
                        : 'text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Grid: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Lock className="size-3.5 text-blue-200" />
                    Password <span className="text-[#FFE8A3]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      onKeyDown={handleKeyDownPassword}
                      onKeyUp={handleKeyDownPassword}
                      className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3.5 pr-10 shadow-inner placeholder:text-slate-400 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[#FFE8A3] text-xs font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-blue-200" />
                    Confirm Password <span className="text-[#FFE8A3]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className="h-10 w-full rounded-xl bg-white text-slate-900 text-sm focus:border-[#FFE8A3] focus:ring-2 focus:ring-[#FFE8A3]/50 border-none pl-3.5 pr-10 shadow-inner placeholder:text-slate-400 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
              </div>

              {/* Caps Lock Alert */}
              {isCapsLockOn && (
                <div className="flex items-center gap-1.5 text-xs text-[#FFE8A3] font-semibold bg-black/20 px-2.5 py-1 rounded-lg">
                  <AlertCircle className="size-3.5 text-amber-300" />
                  Caps Lock is ON
                </div>
              )}

              {/* Terms of Service Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-white">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="size-4 rounded bg-white text-blue-600 focus:ring-[#FFE8A3] cursor-pointer accent-[#FFE8A3] mt-0.5"
                  />
                  <span className="text-[11px] text-blue-100/90 leading-tight">
                    I agree to the{' '}
                    <span className="text-[#FFE8A3] font-semibold hover:underline">
                      Enterprise Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-[#FFE8A3] font-semibold hover:underline">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-[#FFE8A3] text-xs font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3" />
                    {errors.agreeTerms.message}
                  </p>
                )}
              </div>

              {/* Bright Yellow Sign Up Button (#FFE8A3) */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#FFE8A3] hover:bg-[#ffd970] text-[#0d1738] font-bold rounded-full shadow-lg transition-all active:scale-[0.98] text-sm flex items-center justify-center mt-4 cursor-pointer border-none tracking-wide"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4.5 animate-spin text-[#0d1738]" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Already have an account link */}
              <div className="text-center pt-3 border-t border-blue-400/20 mt-4">
                <p className="text-xs text-blue-100/90">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-bold text-[#FFE8A3] hover:underline transition-all ml-1"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer Subtext Below Card */}
        <div className="text-center space-y-1.5 mt-6 mb-2 max-w-sm">
          <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
            Enterprise grade authentication powered by Travel Tech Services.
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-500" />
              256-bit SSL Encrypted
            </span>
            <span>•</span>
            <span>GDPR & ISO Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
