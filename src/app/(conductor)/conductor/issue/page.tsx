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
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <Printer className="size-4.5 text-blue-400" />
            <span>ETIM Ticket Keypad</span>
          </h2>
          <span className="text-[10px] text-slate-400">
            Route {activeDuty.routeNumber} • Machine {activeDuty.etimMachineId}
          </span>
        </div>

        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] font-mono">
          CASH & PINK
        </Badge>
      </div>

      {/* 1. TICKET ISSUING FORM */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl p-4 space-y-3.5">
        {/* Origin / Destination Stepper Row */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          {/* Origin Stop */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              From (Current Stop)
            </span>
            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-[9px]">
              Stage {currentStop.stage}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-white font-black text-sm">
            <MapPin className="size-4 text-emerald-400 shrink-0" />
            <span>{currentStop.name}</span>
          </div>

          <div className="border-t border-slate-800/80 pt-2">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
              Destination (To)
            </span>
            <select
              value={selectedDestStop}
              onChange={(e) => setSelectedDestStop(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-hidden focus:border-blue-500"
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
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Passenger Category
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setPassengerType('Adult')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                passengerType === 'Adult'
                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
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
                  ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
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
                  ? 'bg-pink-600 text-white font-bold border-pink-500 shadow-sm'
                  : 'bg-slate-950 text-pink-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="size-4 mx-auto mb-1 text-pink-400" />
              <span className="text-xs font-bold block">Pink Pass</span>
              <span className="text-[9px] opacity-80 block">Free (₹0)</span>
            </button>
          </div>
        </div>

        {/* Passenger Quantity Stepper */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-xs font-bold text-white block">Quantity</span>
            <span className="text-[10px] text-slate-400 block">Number of tickets</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
              className="size-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold hover:bg-slate-700"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="text-sm font-black text-white font-mono min-w-5 text-center">
              {passengerCount}
            </span>
            <button
              type="button"
              onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}
              className="size-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold hover:bg-slate-700"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Total Calculation & Print Button */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Cash Due
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {passengerType === 'Pink Pass (Free)' ? 'FREE (₹0.00)' : `₹${totalAmount.toFixed(2)}`}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              ₹{farePerPerson} × {passengerCount}
            </span>
          </div>

          <Button
            type="button"
            onClick={handlePrintTicket}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2"
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
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="size-4" />
              PRINTED THERMAL RECEIPT
            </span>
            <button
              onClick={() => setPrintedReceipt(null)}
              className="text-[10px] text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          {/* Paper Receipt Simulation */}
          <div className="p-4 rounded-xl bg-white text-slate-900 font-mono text-xs shadow-xl space-y-2 border-t-8 border-dashed border-slate-400">
            {/* Header */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <h3 className="font-black text-sm tracking-tight text-slate-900">
                DELHI TRANSPORT CORP.
              </h3>
              <span className="text-[10px] text-slate-600 block">GOVT. OF NCT DELHI</span>
              <span className="text-[10px] font-bold block pt-1">
                {printedReceipt.fare === 0 ? '🌸 ZERO-FARE PINK PASS' : 'PASSENGER TICKET (CASH)'}
              </span>
            </div>

            {/* Receipt Details */}
            <div className="text-[10px] space-y-1 py-1">
              <div className="flex justify-between">
                <span>TICKET #:</span>
                <span className="font-bold">{printedReceipt.ticketNumber}</span>
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
                <span className="font-bold">RT {printedReceipt.routeNumber} • {activeDuty.busNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span>{new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>

            {/* Stops */}
            <div className="p-1.5 rounded bg-slate-100 border border-slate-300 text-[11px] font-bold">
              <div>FROM: {printedReceipt.sourceStop}</div>
              <div>TO: {printedReceipt.destinationStop}</div>
            </div>

            {/* Fare Summary */}
            <div className="border-t border-dashed border-slate-300 pt-1.5 flex justify-between font-black text-sm">
              <span>TOTAL FARE:</span>
              <span>{printedReceipt.totalAmount === 0 ? 'FREE (₹0)' : `₹${printedReceipt.totalAmount}.00`}</span>
            </div>

            {/* Barcode Strip */}
            <div className="text-center pt-2 space-y-1">
              <div className="h-6 bg-slate-800 rounded-sm flex items-center justify-center text-white tracking-widest text-[9px]">
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
