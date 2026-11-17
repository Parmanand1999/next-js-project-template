'use client';

import React from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bus,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  Users,
  Route as RouteIcon,
  Megaphone,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Radio,
  FileCheck2,
  Sparkles,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const routes = useDtcStore((state) => state.routes);
  const noTicketChallans = useDtcStore((state) => state.noTicketChallans);
  const invalidTickets = useDtcStore((state) => state.invalidTicketViolations);
  const notices = useDtcStore((state) => state.notices);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const passes = useDtcStore((state) => state.passes);
  const refundRequests = useDtcStore((state) => state.refundRequests);
  const liveBuses = useDtcStore((state) => state.liveBuses);

  const urgentNotice = notices.find((n) => n.priority === 'Urgent' && n.isActive);

  const totalSpotFineCollected = noTicketChallans
    .filter((c) => c.status === 'Paid on Spot')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const pendingAmount = noTicketChallans
    .filter((c) => c.status === 'Pending Payment')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Control Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 mb-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Delhi Transport Corporation • Central Operations & Telematics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            SANCHALAN
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-700 text-white tracking-wide">
              HQ CONTROL ROOM
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time Telemetry &bull; Passenger Mobile App &bull; Conductor ETIM & Duty Dispatch &bull; Flying Squad Vigilance
          </p>
        </div>

        {/* Quick Executive Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/violations/no-ticket">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400">
              <ShieldAlert className="size-3.5" />
              Issue Spot Challan
            </Button>
          </Link>
          <Link href="/admin/notices">
            <Button size="sm" className="gap-1.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs">
              <Megaphone className="size-3.5" />
              Broadcast Circular
            </Button>
          </Link>
        </div>
      </div>

      {/* Urgent Notice Alert Marquee */}
      {urgentNotice && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider shrink-0 animate-pulse">
              Urgent Advisory
            </span>
            <span className="font-bold text-rose-950 dark:text-rose-200 truncate">
              {urgentNotice.title}
            </span>
            <span className="text-rose-800/80 dark:text-rose-300 hidden lg:inline truncate">
              — {urgentNotice.content}
            </span>
          </div>

          <Link href="/admin/notices">
            <Button size="sm" variant="ghost" className="text-xs h-7 text-rose-700 hover:text-rose-900 shrink-0 font-bold">
              Details &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* 4 Primary High-Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Buses */}
        <Card className="border-border/80 bg-gradient-to-br from-card to-emerald-500/5 hover:border-emerald-500/40 transition-all shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-muted-foreground">Active Buses on Road</CardDescription>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Bus className="size-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              3,842 <span className="text-xs font-normal text-muted-foreground">/ 4,100</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center justify-between pt-1">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" /> 93.7% Fleet Active
            </span>
            <span className="text-[11px] font-semibold text-foreground">2,200+ EV Buses</span>
          </CardContent>
        </Card>

        {/* Passenger App & ETIM Bookings */}
        <Card className="border-border/80 bg-gradient-to-br from-card to-blue-500/5 hover:border-blue-500/40 transition-all shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-muted-foreground">Today&apos;s Ticketing Load</CardDescription>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <QrCode className="size-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              1,48,290
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center justify-between pt-1">
            <span className="text-blue-600 font-bold">+14.2% Peak Rush</span>
            <span className="text-pink-600 font-bold">58k Pink Passes (Free)</span>
          </CardContent>
        </Card>

        {/* Active Conductors */}
        <Card className="border-border/80 bg-gradient-to-br from-card to-amber-500/5 hover:border-amber-500/40 transition-all shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-muted-foreground">Conductors on Duty</CardDescription>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Users className="size-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              4,120 <span className="text-xs font-normal text-muted-foreground">Punched In</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center justify-between pt-1">
            <span className="text-amber-600 font-bold">Morning Shift Peak</span>
            <span className="text-[11px] font-semibold text-foreground">ETIM Online: 99.4%</span>
          </CardContent>
        </Card>

        {/* Spot Challans & Fines */}
        <Card className="border-border/80 bg-gradient-to-br from-card to-rose-500/5 hover:border-rose-500/40 transition-all shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-bold text-muted-foreground">Enforcement Spot Fines</CardDescription>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                <ShieldAlert className="size-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-rose-600">
              ₹{totalSpotFineCollected.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-semibold text-muted-foreground">
                ({noTicketChallans.length} Challans)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center justify-between pt-1">
            <span className="text-rose-600 font-bold">₹200 Statutory Penalty</span>
            <Link href="/admin/violations/no-ticket" className="font-bold text-foreground hover:underline">
              Audit Feed &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Middle Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Violations Command & Quick Hubs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vigilance Summary Card */}
          <Card className="border-border rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <ShieldAlert className="size-4 text-rose-600" />
                  Live Vigilance & Violations Feed
                </CardTitle>
                <CardDescription className="text-xs">
                  Apprehended ticketless travelers & rejected fraudulent QR scans recorded today.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1.5">
                <Link href="/admin/violations/no-ticket">
                  <Badge variant="outline" className="text-[10px] font-bold border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/40">
                    {noTicketChallans.length} No-Ticket
                  </Badge>
                </Link>
                <Link href="/admin/violations/invalid-ticket">
                  <Badge variant="outline" className="text-[10px] font-bold border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40">
                    {invalidTickets.length} Invalid QR
                  </Badge>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-3">
              <div className="space-y-2">
                {noTicketChallans.slice(0, 3).map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl border border-border/80 bg-muted/15 flex items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">
                          {ch.challanNumber}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-700 border border-rose-500/20">
                          Spot Fine
                        </span>
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        <strong>{ch.passengerName}</strong> &bull; Rt. {ch.routeNumber} ({ch.busNumber}) &bull; {ch.locationStop}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-foreground">₹{ch.totalAmount}</div>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] font-bold ${
                          ch.status === 'Paid on Spot'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ch.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  {invalidTickets.length} Invalid QR codes intercepted by conductors
                </span>
                <Link
                  href="/admin/violations/invalid-ticket"
                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  View Invalid Log <ArrowRight className="size-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Hub Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/routes-fares" className="block group">
              <Card className="h-full border-border/80 rounded-2xl group-hover:border-emerald-500/60 transition-all shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <RouteIcon className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Routes & Fare Stages</span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Explore official Delhi bus routes (502, Mudrika, 729), stop stages, and fare calculator.
                </p>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 pt-1">
                  {routes.length} Active Corridors Configured &rarr;
                </div>
              </Card>
            </Link>

            <Link href="/admin/notices" className="block group">
              <Card className="h-full border-border/80 rounded-2xl group-hover:border-blue-500/60 transition-all shadow-xs p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      <Megaphone className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Central Notices Board</span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Broadcast circulars, route diversions, and duty instructions to Conductors & Drivers.
                </p>
                <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 pt-1">
                  {notices.length} Live Circulars Active &rarr;
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right (5 cols): High Frequency Corridors & Depot Fleet Capacity */}
        <div className="lg:col-span-5 space-y-6">
          {/* High Frequency Corridors */}
          <Card className="border-border rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <RouteIcon className="size-4 text-emerald-600" />
                  Key DTC Corridors Load
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time frequency & occupancy status.
                </CardDescription>
              </div>
              <Link href="/admin/routes-fares">
                <Button size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground hover:text-foreground font-bold">
                  All Routes
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="space-y-3 pt-3">
              {routes.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-border/80 bg-muted/15 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black px-2 py-0.5 rounded-md bg-foreground text-background text-[11px]">
                        {r.routeNumber}
                      </span>
                      <span className="font-bold text-foreground truncate max-w-[170px]">
                        {r.origin} ⇄ {r.destination}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-300">
                      ~{r.frequencyMinutes}m Freq
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>{r.totalDistanceKm} km &bull; {r.busType}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delhi Depots Status */}
          <Card className="border-border rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-extrabold text-foreground">
                DTC Depot Infrastructure Status
              </CardTitle>
              <CardDescription className="text-xs">
                Fleet rollout, EV fast-charging bay availability.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2.5 text-xs pt-3">
              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <div>
                  <div className="font-bold text-foreground">Millennium Depot (I & II)</div>
                  <div className="text-[10px] text-muted-foreground">EV Fast Charging Bay Hub • 620 Buses</div>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">98% Operational</Badge>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <div>
                  <div className="font-bold text-foreground">Sarojini Nagar Depot</div>
                  <div className="text-[10px] text-muted-foreground">South Delhi Ring Corridors • 340 Buses</div>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">95% Operational</Badge>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <div>
                  <div className="font-bold text-foreground">Rajghat Depot</div>
                  <div className="text-[10px] text-muted-foreground">Central & East Transit • 410 Buses</div>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">92% Operational</Badge>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <div>
                  <div className="font-bold text-foreground">Wazirpur Depot</div>
                  <div className="text-[10px] text-muted-foreground">Outer Ring Road Mudrika Fleet • 390 Buses</div>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">96% Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
