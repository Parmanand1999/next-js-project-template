'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  User,
  Wallet,
  CreditCard,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Settings,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';

export default function PassengerProfilePage() {
  const passengerProfile = useDtcStore((state) => state.passengerProfile);
  const topUpWallet = useDtcStore((state) => state.topUpWallet);

  const [topUpAmount, setTopUpAmount] = useState<number>(100);

  const handleTopUp = (amount: number) => {
    topUpWallet(amount);
    toast.success(`Wallet recharged with ₹${amount}! New balance: ₹${passengerProfile.walletBalance + amount}`);
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">
          Commuter Profile & Transit Wallet
        </h2>
        <p className="text-[11px] text-muted-foreground">
          DTC One Card, wallet balance, and commuter preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center gap-3">
        <div className="size-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
          {passengerProfile.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-black text-foreground truncate">
              {passengerProfile.name}
            </h3>
            <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-600">
              <CheckCircle2 className="size-3.5" />
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block truncate">
            {passengerProfile.phone} • {passengerProfile.email}
          </span>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            Delhi Resident Verified Commuter
          </span>
        </div>
      </div>

      {/* Digital DTC One Transit Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white shadow-xl relative overflow-hidden space-y-4">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 size-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 size-32 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/15">
              DTC ONE
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold">
              Metro & Bus Smart Pass
            </span>
          </div>
          <CreditCard className="size-5 text-emerald-300" />
        </div>

        <div className="relative z-10 pt-2">
          <span className="text-[10px] text-emerald-200/80 font-semibold block uppercase tracking-wider">
            Available Wallet Balance
          </span>
          <div className="text-2xl font-black text-white tracking-tight">
            ₹{passengerProfile.walletBalance.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-emerald-200/70 font-mono pt-1 border-t border-white/15 relative z-10">
          <span>{passengerProfile.dtcCardNumber}</span>
          <span className="text-white font-bold">NCMC ENABLED</span>
        </div>
      </div>

      {/* Quick Wallet Recharge Pills */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Quick Recharge DTC Wallet
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[100, 200, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => handleTopUp(amt)}
              className="py-2.5 rounded-xl border border-border/80 bg-card hover:border-emerald-500/60 shadow-2xs font-bold text-xs text-foreground flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Plus className="size-3 text-emerald-600" />
              <span>₹{amt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Commuter Pass Schemes */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-card to-rose-500/10 border border-pink-500/20 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-pink-600" />
            <span className="text-xs font-bold text-foreground">
              Pink Free Pass Scheme
            </span>
          </div>
          <Badge className="bg-pink-600 text-white font-bold text-[10px]">
            Active
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Female commuters are entitled to 100% free travel across standard DTC buses under the GNCTD Women Empowerment Scheme.
        </p>
      </div>

      {/* App Version & Info */}
      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 text-center space-y-1">
        <div className="text-xs font-bold text-foreground">
          DTC Sanchalan One v1.0.4 (Build 240)
        </div>
        <p className="text-[10px] text-muted-foreground">
          Delhi Transport Corporation • Transport Dept. GNCTD
        </p>
      </div>
    </div>
  );
}
