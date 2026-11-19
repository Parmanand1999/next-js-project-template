'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Printer,
  Sparkles,
  MapPin,
  ArrowRight,
  Plus,
  Minus,
  Coins,
  CheckCircle2,
  Receipt,
  User,
  Users,
  Clock,
  RotateCcw,
} from 'lucide-react';

export default function ConductorIssueTicketPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const routes = useDtcStore((state) => state.routes);
  const currentStopIndex = useDtcStore((state) => state.currentStopIndex);
  const calculateFare = useDtcStore((state) => state.calculateFare);
  const issueEtimTicket = useDtcStore((state) => state.issueEtimTicket);

  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];
  const assignedRoute = routes.find((r) => r.routeNumber === activeDuty.routeNumber) || routes[0];

  const currentStop = assignedRoute.stops[currentStopIndex] || assignedRoute.stops[0];

  // Destination Stop Selection
  const destinationStops = useMemo(() => {
    return assignedRoute.stops.slice(currentStopIndex + 1);
  }, [assignedRoute, currentStopIndex]);

  const [selectedDestStop, setSelectedDestStop] = useState<string>(
    destinationStops[0]?.name || assignedRoute.stops[assignedRoute.stops.length - 1]?.name || 'Janpath / CP'
  );

  const [passengerType, setPassengerType] = useState<'Adult' | 'Child' | 'Pink Pass (Free)'>('Adult');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [printedReceipt, setPrintedReceipt] = useState<any | null>(null);

  // Compute calculated fare
  const farePerPerson = useMemo(() => {
    if (passengerType === 'Pink Pass (Free)') return 0;

    const fromIdx = assignedRoute.stops.findIndex((s) => s.name === currentStop.name);
    const toIdx = assignedRoute.stops.findIndex((s) => s.name === selectedDestStop);

    if (fromIdx !== -1 && toIdx !== -1) {
      const dist = Math.abs(assignedRoute.stops[toIdx].distanceKm - assignedRoute.stops[fromIdx].distanceKm);
      const standardFare = calculateFare(assignedRoute.busType, Math.max(1, dist));
      if (passengerType === 'Child') {
        return Math.max(5, Math.floor(standardFare / 2));
      }
      return standardFare;
    }
    return 15;
  }, [assignedRoute, currentStop, selectedDestStop, passengerType, calculateFare]);

  const totalAmount = farePerPerson * passengerCount;

  // Print Cash Ticket
  const handlePrintTicket = () => {
    const ticket = issueEtimTicket({
      origin: currentStop.name,
      destination: selectedDestStop,
      routeNumber: activeDuty.routeNumber,
      busType: assignedRoute.busType,
      passengerType,
      count: passengerCount,
      fare: farePerPerson,
    });

    setPrintedReceipt(ticket);
    toast.success(`Ticket #${ticket.ticketNumber} printed successfully!`);
  };

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-foreground flex items-center gap-1.5">
            <Printer className="size-4.5 text-emerald-600" />
            <span>ETIM Ticket Keypad</span>
          </h2>
          <span className="text-[10px] text-muted-foreground">
            Route {activeDuty.routeNumber} • Machine {activeDuty.etimMachineId}
          </span>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-mono">
          CASH & PINK
        </Badge>
      </div>

      {/* 1. TICKET ISSUING FORM */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-4 space-y-3.5">
        {/* Origin / Destination Stepper Row */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
          {/* Origin Stop */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              From (Current Stop)
            </span>
            <Badge variant="outline" className="text-[9px]">
              Stage {currentStop.stage}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-foreground font-black text-sm">
            <MapPin className="size-4 text-emerald-600 shrink-0" />
            <span>{currentStop.name}</span>
          </div>

          <div className="border-t border-border pt-2.5">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">
              Destination (To)
            </span>
            <select
              value={selectedDestStop}
              onChange={(e) => setSelectedDestStop(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {destinationStops.length === 0 ? (
                <option value={assignedRoute.destination}>{assignedRoute.destination} (Terminal)</option>
              ) : (
                destinationStops.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} (Stage {s.stage} • ~{Math.abs(Math.round((s.distanceKm - currentStop.distanceKm) * 10) / 10)} km)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Passenger Category Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Passenger Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPassengerType('Adult')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                passengerType === 'Adult'
                  ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
            >
              <User className="size-4 mx-auto mb-1" />
              <span className="text-xs font-bold block">Adult</span>
              <span className="text-[9px] opacity-80 block">Full Fare</span>
            </button>

            <button
              type="button"
              onClick={() => setPassengerType('Child')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                passengerType === 'Child'
                  ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
            >
              <Users className="size-4 mx-auto mb-1" />
              <span className="text-xs font-bold block">Child</span>
              <span className="text-[9px] opacity-80 block">Half Fare</span>
            </button>

            <button
              type="button"
              onClick={() => setPassengerType('Pink Pass (Free)')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                passengerType === 'Pink Pass (Free)'
                  ? 'bg-pink-600 text-white font-bold border-pink-600 shadow-xs'
                  : 'bg-pink-50/70 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:border-pink-900 dark:text-pink-300 hover:bg-pink-100/50'
              }`}
            >
              <Sparkles className="size-4 mx-auto mb-1 text-pink-500" />
              <span className="text-xs font-bold block">Pink Pass</span>
              <span className="text-[9px] opacity-80 block">Free (₹0)</span>
            </button>
          </div>
        </div>

        {/* Passenger Quantity Stepper */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
          <div>
            <span className="text-xs font-bold text-foreground block">Quantity</span>
            <span className="text-[10px] text-muted-foreground block">Number of tickets</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
              className="size-8 rounded-lg bg-background border border-border text-foreground flex items-center justify-center font-bold hover:bg-muted"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="text-sm font-black text-foreground font-mono min-w-5 text-center">
              {passengerCount}
            </span>
            <button
              type="button"
              onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}
              className="size-8 rounded-lg bg-background border border-border text-foreground flex items-center justify-center font-bold hover:bg-muted"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Total Calculation & Print Button */}
        <div className="pt-2 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Total Cash Due
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {passengerType === 'Pink Pass (Free)' ? 'FREE (₹0.00)' : `₹${totalAmount.toFixed(2)}`}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              ₹{farePerPerson} × {passengerCount}
            </span>
          </div>

          <Button
            type="button"
            onClick={handlePrintTicket}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Printer className="size-4" />
            <span>
              {passengerType === 'Pink Pass (Free)'
                ? 'Print Free Pink Ticket'
                : `Print Cash Ticket (Collect ₹${totalAmount})`}
            </span>
          </Button>
        </div>
      </Card>

      {/* 2. PRINTED THERMAL PAPER RECEIPT PREVIEW */}
      {printedReceipt && (
        <div className="space-y-2 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="size-4" />
              PRINTED THERMAL RECEIPT
            </span>
            <button
              onClick={() => setPrintedReceipt(null)}
              className="text-[10px] text-muted-foreground hover:text-foreground font-medium"
            >
              Dismiss
            </button>
          </div>

          {/* Paper Receipt Simulation */}
          <div className="p-4 rounded-xl bg-white text-slate-900 font-mono text-xs shadow-md border border-slate-200 space-y-2 border-t-8 border-dashed border-emerald-600">
            {/* Header */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <h3 className="font-black text-sm tracking-tight text-slate-900">
                DELHI TRANSPORT CORP.
              </h3>
              <span className="text-[10px] text-slate-600 block">GOVT. OF NCT DELHI</span>
              <span className="text-[10px] font-bold block pt-1 text-emerald-800">
                {printedReceipt.fare === 0 ? '🌸 ZERO-FARE PINK PASS' : 'PASSENGER TICKET (CASH)'}
              </span>
            </div>

            {/* Receipt Details */}
            <div className="text-[10px] space-y-1 py-1 text-slate-700">
              <div className="flex justify-between">
                <span>TICKET #:</span>
                <span className="font-bold text-slate-900">{printedReceipt.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>MACHINE:</span>
                <span>{activeDuty.etimMachineId}</span>
              </div>
              <div className="flex justify-between">
                <span>CONDUCTOR:</span>
                <span>{activeDuty.badgeNumber} ({activeDuty.conductorName.split(' ')[0]})</span>
              </div>
              <div className="flex justify-between">
                <span>ROUTE / BUS:</span>
                <span className="font-bold text-slate-900">RT {printedReceipt.routeNumber} • {activeDuty.busNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span>{new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>

            {/* Stops */}
            <div className="p-2 rounded bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-900">
              <div>FROM: {printedReceipt.sourceStop}</div>
              <div>TO: {printedReceipt.destinationStop}</div>
            </div>

            {/* Fare Summary */}
            <div className="border-t border-dashed border-slate-300 pt-1.5 flex justify-between font-black text-sm text-slate-900">
              <span>TOTAL FARE:</span>
              <span className="text-emerald-700">{printedReceipt.totalAmount === 0 ? 'FREE (₹0)' : `₹${printedReceipt.totalAmount}.00`}</span>
            </div>

            {/* Barcode Strip */}
            <div className="text-center pt-2 space-y-1">
              <div className="h-6 bg-slate-900 rounded-xs flex items-center justify-center text-white tracking-widest text-[9px]">
                ||| | |||| | ||||| ||| ||| |
              </div>
              <span className="text-[8px] text-slate-500 block">
                NON-TRANSFERABLE • VALID FOR ONE TRIP ONLY
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
