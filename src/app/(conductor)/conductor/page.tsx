'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  QrCode,
  Printer,
  ShieldAlert,
  MapPin,
  ArrowRight,
  Sparkles,
  Users,
  Coins,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export default function ConductorDashboardPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const routes = useDtcStore((state) => state.routes);
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const noTicketChallans = useDtcStore((state) => state.noTicketChallans);
  const currentStopIndex = useDtcStore((state) => state.currentStopIndex);
  const advanceBusStop = useDtcStore((state) => state.advanceBusStop);
  const reverseBusStop = useDtcStore((state) => state.reverseBusStop);
  const issueEtimTicket = useDtcStore((state) => state.issueEtimTicket);

  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];
  const assignedRoute = routes.find((r) => r.routeNumber === activeDuty.routeNumber) || routes[0];

  const currentStop = assignedRoute.stops[currentStopIndex] || assignedRoute.stops[0];
  const nextStop = assignedRoute.stops[currentStopIndex + 1];
  const prevStop = currentStopIndex > 0 ? assignedRoute.stops[currentStopIndex - 1] : null;

  const totalPassengers =
    activeDuty.ticketsSoldDigital + activeDuty.ticketsSoldCash + activeDuty.pinkTicketsIssued;

  // 1-Tap Quick Pink Ticket Handler
  const handleQuickPinkTicket = () => {
    const dest = nextStop ? nextStop.name : assignedRoute.destination;
    const ticket = issueEtimTicket({
      origin: currentStop.name,
      destination: dest,
      routeNumber: activeDuty.routeNumber,
      busType: assignedRoute.busType,
      passengerType: 'Pink Pass (Free)',
      count: 1,
      fare: 0,
    });

    toast.success(`Zero-Fare Pink Ticket #${ticket.ticketNumber} printed for female commuter!`);
  };

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* 1. CURRENT BUS STOP TELEMETRY & STEPPER */}
      <Card className="bg-slate-900 border-slate-800 shadow-md rounded-2xl overflow-hidden">
        <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Live Stage {currentStop.stage} of {assignedRoute.stops[assignedRoute.stops.length - 1]?.stage || 7}
            </span>
          </div>
          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono">
            Stop {currentStopIndex + 1}/{assignedRoute.stops.length}
          </Badge>
        </div>

        <CardContent className="p-3.5 space-y-3">
          {/* Current Stop Display */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Current Bus Shelter / Halting Stop
            </span>
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-emerald-400 shrink-0" />
              <h2 className="text-base font-black text-white tracking-tight">
                {currentStop.name}
              </h2>
            </div>
            {nextStop && (
              <span className="text-[11px] text-slate-400 block pl-7">
                ➔ Next Stop:{' '}
                <strong className="text-slate-200 font-bold">{nextStop.name}</strong> (~
                {Math.abs(Math.round((nextStop.distanceKm - currentStop.distanceKm) * 10) / 10)} km)
              </span>
            )}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentStopIndex <= 0}
              onClick={() => {
                reverseBusStop();
                toast.info(`Bus position set back to: ${prevStop?.name}`);
              }}
              className="h-8 px-2.5 rounded-xl border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-30"
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
              className="flex-1 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
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
          <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-2">
            <QrCode className="size-5" />
            <div className="text-left">
              <span className="block leading-none">Scan Passenger QR</span>
              <span className="text-[9px] font-normal opacity-80">Instant Verification</span>
            </div>
          </Button>
        </Link>

        <Link href="/conductor/issue" className="block">
          <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-blue-950 flex items-center justify-center gap-2">
            <Printer className="size-5" />
            <div className="text-left">
              <span className="block leading-none">Issue Cash Ticket</span>
              <span className="text-[9px] font-normal opacity-80">ETIM Print Keypad</span>
            </div>
          </Button>
        </Link>
      </div>

      {/* Secondary Fast Action Row */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={handleQuickPinkTicket}
          className="h-10 rounded-xl bg-gradient-to-r from-pink-600/30 to-rose-600/30 hover:bg-pink-600/40 border border-pink-500/40 text-pink-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Sparkles className="size-4 text-pink-400" />
          <span>1-Tap Free Pink Ticket</span>
        </Button>

        <Link href="/conductor/challan" className="block">
          <Button
            type="button"
            className="w-full h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ShieldAlert className="size-4 text-amber-400" />
            <span>Section 178 Challan</span>
          </Button>
        </Link>
      </div>

      {/* 3. SHIFT PASSENGER & CASH TELEMETRY METRICS */}
      <div className="grid grid-cols-2 gap-2">
        {/* Digital QR Scans */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Digital QR Validated</span>
            <QrCode className="size-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white font-mono">{activeDuty.ticketsSoldDigital}</span>
            <span className="text-[10px] text-emerald-400 font-bold">App QRs</span>
          </div>
        </div>

        {/* Cash Tickets Sold */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Cash Paper Tickets</span>
            <Coins className="size-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white font-mono">{activeDuty.ticketsSoldCash}</span>
            <span className="text-[10px] text-blue-400 font-bold">ETIM Rolls</span>
          </div>
        </div>

        {/* Pink Passes Issued */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Free Pink Passes</span>
            <Sparkles className="size-3.5 text-pink-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white font-mono">{activeDuty.pinkTicketsIssued}</span>
            <span className="text-[10px] text-pink-400 font-bold">₹0 Scheme</span>
          </div>
        </div>

        {/* Total Commuters On Shift */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Commuters</span>
            <Users className="size-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white font-mono">{totalPassengers}</span>
            <span className="text-[10px] text-slate-400 font-bold">Total</span>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LOGS */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="size-3.5 text-emerald-400" />
            Recent Terminal Transactions
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Realtime Sync</span>
        </div>

        <div className="space-y-1.5">
          {passengerTickets.slice(0, 4).map((ticket) => {
            const isPink = ticket.fare === 0;
            const isDigital = ticket.paymentMode !== 'Cash';

            return (
              <div
                key={ticket.id}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 font-bold text-white truncate">
                    <span className="truncate">{ticket.sourceStop || ticket.boardingStop}</span>
                    <ArrowRight className="size-3 text-slate-500 shrink-0" />
                    <span className="truncate">{ticket.destinationStop}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-mono text-slate-300">#{ticket.ticketNumber.slice(-8)}</span>
                    <span>•</span>
                    <span>{ticket.passengersCount} Commuter{ticket.passengersCount > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="text-slate-500">{ticket.bookedAt}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge
                    className={`text-[9px] font-bold ${
                      isPink
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                        : isDigital
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
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
