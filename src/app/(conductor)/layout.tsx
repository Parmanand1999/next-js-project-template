'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDtcStore } from '@/store/useDtcStore';
import { DtcLogo } from '@/components/common/DtcLogo';
import {
  LayoutDashboard,
  QrCode,
  ShieldAlert,
  ArrowLeftRight,
  BatteryCharging,
  Wifi,
  Bus,
} from 'lucide-react';

export default function ConductorAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];

  const navItems = [
    {
      label: 'Duty',
      href: '/conductor',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Scan QR',
      href: '/conductor/scan',
      icon: QrCode,
    },
    {
      label: 'Challan',
      href: '/conductor/challan',
      icon: ShieldAlert,
    },
    {
      label: 'Handover',
      href: '/conductor/handover',
      icon: ArrowLeftRight,
    },
  ];

  const isNavActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-slate-900/5 dark:bg-black text-foreground flex justify-center selection:bg-emerald-500 selection:text-white">
      {/* Mobile Conductor App Viewport */}
      <div className="w-full max-w-md min-h-screen bg-background flex flex-col relative shadow-2xl border-x border-border/40 pb-20">
        {/* Conductor App Header Bar */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/80 px-3.5 py-2 shadow-2xs">
          {/* Top Status Telemetry Line */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1.5 border-b border-border/60 font-mono">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <Wifi className="size-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>ONLINE 4G</span>
              </span>
              <span>•</span>
              <span className="text-foreground font-semibold">GPS Active</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <BatteryCharging className="size-3 text-emerald-600" />
                <span>92% Battery</span>
              </span>
            </div>
          </div>

          {/* Conductor & Bus Information Row */}
          <div className="flex items-center justify-between pt-1.5">
            <div className="flex items-center gap-2">
              <DtcLogo size={28} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-foreground tracking-wide">
                    {activeDuty.conductorName}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                    {activeDuty.badgeNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <Bus className="size-3 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Route {activeDuty.routeNumber}</span>
                  <span>•</span>
                  <span>{activeDuty.busNumber}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block">
                Cash in Bag
              </span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                ₹{activeDuty.totalCashCollected}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>

        {/* Fixed Conductor Bottom Navigation Bar */}
        <nav
          aria-label="Conductor Terminal Navigation"
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 h-16 bg-card/95 backdrop-blur-lg border-t border-border flex items-center justify-around px-1 shadow-lg"
        >
          {navItems.map((item) => {
            const active = isNavActive(item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-150 ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}

                <Icon className={`size-5 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="text-[10px] leading-tight mt-1 truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
