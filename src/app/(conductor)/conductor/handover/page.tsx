'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeftRight,
  Coins,
  QrCode,
  Printer,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  FileCheck,
} from 'lucide-react';

export default function ConductorHandoverPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const shiftHandovers = useDtcStore((state) => state.shiftHandovers);
  const routes = useDtcStore((state) => state.routes);
  const currentStopIndex = useDtcStore((state) => state.currentStopIndex);
  const recordShiftHandover = useDtcStore((state) => state.recordShiftHandover);
  const endConductorDuty = useDtcStore((state) => state.endConductorDuty);

  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];
  const assignedRoute = routes.find((r) => r.routeNumber === activeDuty.routeNumber) || routes[0];
  const currentStop = assignedRoute.stops[currentStopIndex] || assignedRoute.stops[0];

  const [toConductor, setToConductor] = useState<string>('Jagdish Chandra');
  const [toBadge, setToBadge] = useState<string>('DTC-C-3389');
  const [etimStatus, setEtimStatus] = useState<'Healthy' | 'Battery Low' | 'Paper Roll Replaced'>('Healthy');
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [lastHandoverCode, setLastHandoverCode] = useState<string | null>(null);

  const totalPassengers =
    activeDuty.ticketsSoldDigital + activeDuty.ticketsSoldCash + activeDuty.pinkTicketsIssued;

  const handleCompleteHandover = (e: React.FormEvent) => {
    e.preventDefault();

    const handoverCode = `HND-2026-${Math.floor(100 + Math.random() * 900)}`;

    recordShiftHandover({
      fromConductor: activeDuty.conductorName,
      fromBadge: activeDuty.badgeNumber,
      toConductor,
      toBadge,
      busNumber: activeDuty.busNumber,
      routeNumber: activeDuty.routeNumber,
      handoverStop: currentStop.name,
      cashHandedOver: activeDuty.totalCashCollected,
      etimStatus,
      status: 'Accepted',
      notes: handoverNotes || 'Shift handover completed with full cash tally verified.',
    });

    endConductorDuty(activeDuty.id, activeDuty.totalCashCollected);
    setLastHandoverCode(handoverCode);
    toast.success(`Shift Handover #${handoverCode} completed successfully!`);
  };

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <ArrowLeftRight className="size-4.5 text-emerald-400" />
            <span>Shift Handover & End Duty</span>
          </h2>
          <span className="text-[10px] text-slate-400">
            Cash Tally & Next Conductor Transition
          </span>
        </div>

        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
          {activeDuty.status}
        </Badge>
      </div>

      {/* 1. SHIFT RECONCILIATION SUMMARY */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl p-4 space-y-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
          Today&apos;s Duty Collection Summary
        </span>

        {/* Big Cash Counter Card */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-950 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Total Cash to Hand Over
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ₹{activeDuty.totalCashCollected}.00
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Verified in physical leather pouch
            </span>
          </div>

          <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Coins className="size-6" />
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Digital QRs</span>
            <span className="text-sm font-black text-white font-mono">{activeDuty.ticketsSoldDigital}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Cash Tickets</span>
            <span className="text-sm font-black text-white font-mono">{activeDuty.ticketsSoldCash}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Pink Free</span>
            <span className="text-sm font-black text-white font-mono">{activeDuty.pinkTicketsIssued}</span>
          </div>
        </div>
      </Card>

      {/* 2. HANDOVER SUBMISSION FORM */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl p-4 space-y-3">
        <form onSubmit={handleCompleteHandover} className="space-y-3">
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Relieving / Next Conductor Name *
              </label>
              <input
                type="text"
                required
                value={toConductor}
                onChange={(e) => setToConductor(e.target.value)}
                placeholder="e.g. Jagdish Chandra"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-semibold focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Next Conductor Badge *
                </label>
                <input
                  type="text"
                  required
                  value={toBadge}
                  onChange={(e) => setToBadge(e.target.value)}
                  placeholder="DTC-C-3389"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  ETIM Machine Health
                </label>
                <select
                  value={etimStatus}
                  onChange={(e) => setEtimStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Healthy">Healthy (Battery OK)</option>
                  <option value="Paper Roll Replaced">Paper Roll Replaced</option>
                  <option value="Battery Low">Battery Low (Charge Needed)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Handover Halting Stop
              </label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold flex items-center gap-1.5">
                <MapPin className="size-3.5 text-emerald-400" />
                <span>{currentStop.name} (Stop {currentStopIndex + 1})</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Conductor Shift Notes (Optional)
              </label>
              <input
                type="text"
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="e.g. All 184 digital QRs verified. No discrepancies."
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="size-4" />
            <span>Submit Shift Handover (₹{activeDuty.totalCashCollected})</span>
          </Button>
        </form>
      </Card>

      {/* 3. LAST COMPLETED HANDOVER RECEIPT */}
      {lastHandoverCode && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
              <FileCheck className="size-4 text-emerald-400" />
              HANDOVER CODE #{lastHandoverCode}
            </span>
            <Badge className="bg-emerald-500 text-slate-950 font-bold text-[9px]">
              SHIFT TRANSFERRED
            </Badge>
          </div>
          <p className="text-[11px] text-slate-300">
            Duty successfully handed over to <strong>{toConductor}</strong> ({toBadge}) at {currentStop.name}.
            Total cash in pouch: ₹{activeDuty.totalCashCollected}.
          </p>
        </div>
      )}

      {/* 4. PAST SHIFT HANDOVER LOGS */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Past Shift Transitions ({shiftHandovers.length})
        </span>

        <div className="space-y-1.5">
          {shiftHandovers.map((sh) => (
            <div
              key={sh.id}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">
                  {sh.fromBadge} ➔ {sh.toBadge} ({sh.toConductor.split(' ')[0]})
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {sh.handoverCode} • {sh.handoverStop}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-400 font-mono block">
                  ₹{sh.cashHandedOver}
                </span>
                <Badge className="text-[8px] bg-slate-800 text-slate-300">
                  {sh.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
