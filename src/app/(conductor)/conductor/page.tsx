'use client';

import React from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  QrCode,
  ShieldAlert,
  ArrowLeftRight,
  MapPin,
  ArrowRight,
  Sparkles,
  Users,
  Coins,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export default function ConductorDashboardPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const routes = useDtcStore((state) => state.routes);
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const currentStopIndex = useDtcStore((state) => state.currentStopIndex);
  const advanceBusStop = useDtcStore((state) => state.advanceBusStop);
  const reverseBusStop = useDtcStore((state) => state.reverseBusStop);

  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];
  const assignedRoute = routes.find((r) => r.routeNumber === activeDuty.routeNumber) || routes[0];

  const currentStop = assignedRoute.stops[currentStopIndex] || assignedRoute.stops[0];
  const nextStop = assignedRoute.stops[currentStopIndex + 1];
  const prevStop = currentStopIndex > 0 ? assignedRoute.stops[currentStopIndex - 1] : null;

  const totalPassengers =
    activeDuty.ticketsSoldDigital + activeDuty.ticketsSoldCash + activeDuty.pinkTicketsIssued;

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* 1. CURRENT BUS STOP TELEMETRY & STEPPER */}
      <Card className="bg-card border-border/80 shadow-xs rounded-2xl overflow-hidden">
        <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Live Stage {currentStop.stage} of {assignedRoute.stops[assignedRoute.stops.length - 1]?.stage || 7}
            </span>
          </div>
          <Badge className="bg-background text-foreground border-border text-[10px] font-mono">
            Stop {currentStopIndex + 1}/{assignedRoute.stops.length}
          </Badge>
        </div>

        <CardContent className="p-3.5 space-y-3">
          {/* Current Stop Display */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Current Bus Shelter / Halting Stop
            </span>
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-emerald-600 shrink-0" />
              <h2 className="text-base font-black text-foreground tracking-tight">
                {currentStop.name}
              </h2>
            </div>
            {nextStop && (
              <span className="text-[11px] text-muted-foreground block pl-7">
                ➔ Next Stop:{' '}
                <strong className="text-foreground font-bold">{nextStop.name}</strong> (~
                {Math.abs(Math.round((nextStop.distanceKm - currentStop.distanceKm) * 10) / 10)} km)
              </span>
            )}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2 pt-1 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentStopIndex <= 0}
              onClick={() => {
                reverseBusStop();
                toast.info(`Bus position set back to: ${prevStop?.name}`);
              }}
              className="h-8 px-2.5 rounded-xl border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-bold disabled:opacity-30"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              <span>Prev</span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={!nextStop}
              onClick={() => {
                advanceBusStop();
                toast.success(`Bus arrived at: ${nextStop?.name}`);
              }}
              className="flex-1 h-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <span>Arrived at Next Stop</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. PRIMARY ACTION BAR */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/conductor/scan" className="block">
          <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2">
            <QrCode className="size-5" />
            <div className="text-left">
              <span className="block leading-none">Scan Passenger QR</span>
              <span className="text-[9px] font-normal opacity-90">Instant Verification</span>
            </div>
          </Button>
        </Link>

        <Link href="/conductor/challan" className="block">
          <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2">
            <ShieldAlert className="size-5" />
            <div className="text-left">
              <span className="block leading-none">Section 178 Challan</span>
              <span className="text-[9px] font-normal opacity-90">UPI QR & Fine Desk</span>
            </div>
          </Button>
        </Link>
      </div>

      {/* Secondary Action: Shift Handover */}
      <Link href="/conductor/handover" className="block">
        <Button
          type="button"
          className="w-full h-11 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-900 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
        >
          <ArrowLeftRight className="size-4 text-blue-600" />
          <span>Shift Handover & End Duty (Tally ₹{activeDuty.totalCashCollected} Cash)</span>
        </Button>
      </Link>

      {/* 3. SHIFT PASSENGER & CASH TELEMETRY METRICS */}
      <div className="grid grid-cols-2 gap-2">
        {/* Digital QR Scans */}
        <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Digital QR Validated</span>
            <QrCode className="size-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-foreground font-mono">{activeDuty.ticketsSoldDigital}</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">App QRs</span>
          </div>
        </div>

        {/* Cash Tickets Sold */}
        <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Cash Paper Tickets</span>
            <Coins className="size-3.5 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-foreground font-mono">{activeDuty.ticketsSoldCash}</span>
            <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">Offline / Cash</span>
          </div>
        </div>

        {/* Pink Passes Issued */}
        <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Free Pink Passes</span>
            <Sparkles className="size-3.5 text-pink-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-foreground font-mono">{activeDuty.pinkTicketsIssued}</span>
            <span className="text-[10px] text-pink-700 dark:text-pink-400 font-bold">₹0 Scheme</span>
          </div>
        </div>

        {/* Total Commuters On Shift */}
        <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Commuters</span>
            <Users className="size-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-foreground font-mono">{totalPassengers}</span>
            <span className="text-[10px] text-muted-foreground font-bold">Total</span>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LOGS */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-emerald-600" />
            Recent Terminal Transactions
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">Realtime Sync</span>
        </div>

        <div className="space-y-1.5">
          {passengerTickets.slice(0, 4).map((ticket) => {
            const isPink = ticket.fare === 0;
            const isDigital = ticket.paymentMode !== 'Cash';

            return (
              <div
                key={ticket.id}
                className="p-2.5 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
                    <span className="truncate">{ticket.sourceStop || ticket.boardingStop}</span>
                    <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{ticket.destinationStop}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-mono text-foreground font-medium">#{ticket.ticketNumber.slice(-8)}</span>
                    <span>•</span>
                    <span>{ticket.passengersCount} Commuter{ticket.passengersCount > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="text-muted-foreground/80">{ticket.bookedAt}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge
                    className={`text-[9px] font-bold ${
                      isPink
                        ? 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20'
                        : isDigital
                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/20'
                    }`}
                  >
                    {isPink ? 'FREE PINK' : `₹${ticket.totalAmount}`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
