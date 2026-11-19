'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDtcStore } from '@/store/useDtcStore';
import { DtcLogo } from '@/components/common/DtcLogo';
import {
  Home,
  QrCode,
  Bus,
  LifeBuoy,
  User,
  ShieldAlert,
  Bell,
  Sparkles,
} from 'lucide-react';

export default function PassengerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const passengerProfile = useDtcStore((state) => state.passengerProfile);
  const passengerTickets = useDtcStore((state) => state.passengerTickets);

  const activeTicketsCount = passengerTickets.filter((t) => t.status === 'Valid').length;

  const navItems = [
    {
      label: 'Home',
      href: '/passenger',
      icon: Home,
      exact: true,
    },
    {
      label: 'Tickets',
      href: '/passenger/tickets',
      icon: QrCode,
      badge: activeTicketsCount > 0 ? activeTicketsCount : undefined,
    },
    {
      label: 'Live Bus',
      href: '/passenger/live',
      icon: Bus,
    },
    {
      label: 'Help & SOS',
      href: '/passenger/support',
      icon: LifeBuoy,
    },
    {
      label: 'Profile',
      href: '/passenger/profile',
      icon: User,
    },
  ];

  const isNavActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-slate-900/5 dark:bg-black text-foreground flex justify-center selection:bg-emerald-500 selection:text-white">
      {/* Mobile Smartphone Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-background flex flex-col relative shadow-2xl border-x border-border/40 pb-20">
        
        {/* Top Sticky App Bar */}
        <header className="sticky top-0 z-40 h-14 bg-card/95 backdrop-blur-md border-b border-border/80 px-3.5 flex items-center justify-between shadow-2xs">
          <Link href="/passenger" className="flex items-center gap-2 group">
            <DtcLogo size={30} className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight text-foreground leading-none">
                DTC SANCHALAN
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">
                Delhi Govt. Commuter App
              </span>
            </div>
          </Link>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Emergency SOS Button */}
            <Link
              href="/passenger/support"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black tracking-wider uppercase shadow-xs transition-colors animate-pulse"
              title="Emergency SOS Assistance"
            >
              <ShieldAlert className="size-3" />
              <span>SOS</span>
            </Link>
          </div>
        </header>

        {/* Main Passenger Mobile Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <nav
          aria-label="Passenger Bottom Navigation"
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
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon className={`size-5 transition-transform ${active ? 'scale-110' : ''}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 size-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-background animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>

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
