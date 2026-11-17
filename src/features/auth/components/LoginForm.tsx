'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Bus,
  ShieldCheck,
  Loader2,
  Lock,
  Mail,
  CheckCircle2,
  Route,
  Megaphone,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/store/useAuthStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email / Officer ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken || state.user));

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  const { register, handleSubmit, setValue } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@dtc.delhi.gov.in',
      password: '••••••••',
    },
  });

  const performLogin = (role: 'admin' | 'depot_manager') => {
    setLoading(true);
    setTimeout(() => {
      login({
        userDetails: {
          id: role === 'admin' ? 'dtc_hq_admin' : 'dtc_depot_mgr',
          name: role === 'admin' ? 'DTC Central Controller' : 'Depot Manager (Millennium)',
          email: role === 'admin' ? 'admin@dtc.delhi.gov.in' : 'manager.millennium@dtc.delhi.gov.in',
          roleName: 'Administrator',
          isSuperAdmin: true,
          permissions: ['admin:view', 'reports:view', 'system:view'],
        },
        accessToken: 'session_access_token_sanchalan',
      });
      toast.success('Welcome to SANCHALAN - DTC Central Command Portal');
      router.replace('/admin');
      setLoading(false);
    }, 400);
  };

  const onSubmit = () => {
    performLogin('admin');
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* LEFT SIDE: DTC Sanchalan Showcase */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 size-[450px] rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 size-[450px] rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-400 shadow-lg">
            <Bus className="size-6 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-wider text-white leading-none">
              SANCHALAN
            </span>
            <span className="text-[10px] font-bold text-emerald-300 tracking-widest uppercase mt-0.5">
              Delhi Transport Corporation • GNCTD
            </span>
          </div>
        </div>

        {/* Showcase Highlights */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-200 border border-white/20 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-emerald-300" />
              Unified Transit Control & Vigilance Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.2]">
              Delhi&apos;s Next-Gen Intelligent Transit Operations.
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed font-light">
              Connecting Passenger Mobile Ticketing, Conductor ETIM Shift Duty, Live GPS Fleet Tracking, and Ticketless Vigilance Enforcement.
            </p>
          </div>

          <div className="space-y-3 border-t border-white/15 pt-5 text-xs text-emerald-100/80">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Routes & Slabs:</strong> Official DTC Govt fare stages (AC ₹10–₹25, Non-AC ₹5–₹15, Free Pink Pass).</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Enforcement:</strong> Spot Challans for No-Ticket (₹200 fine) and Invalid QR audit log.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Crew Ops:</strong> Conductor duty roster, attendance, cash reconciliation & handover logs.</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-emerald-300/70 border-t border-white/10 pt-4">
          <span>&copy; Delhi Transport Corporation, Government of NCT of Delhi</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            Official Operations Portal
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Card */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-2">
              <ShieldCheck className="size-3.5" />
              Authorized Personnel Login
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Sign In to Sanchalan
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter credentials or use the 1-Click Demo Login to explore the admin panel.
            </p>
          </div>

          {/* 1-Click Demo Login Button (Highlight) */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 text-center">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              🚀 1-Click Demo Mode Active
            </div>
            <Button
              onClick={() => performLogin('admin')}
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-10 shadow-sm"
            >
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Sign In as DTC Central Admin (Instant Access)
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-[11px] text-muted-foreground font-normal shrink-0">
              or enter officer credentials
            </span>
            <div className="border-t border-border w-full" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Email / Officer ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  {...register('email')}
                  className="pl-9 h-10 text-xs"
                  placeholder="admin@dtc.delhi.gov.in"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  {...register('password')}
                  className="pl-9 h-10 text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
