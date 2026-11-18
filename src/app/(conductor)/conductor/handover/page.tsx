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
          <h2 className="text-base font-black text-foreground flex items-center gap-1.5">
            <ArrowLeftRight className="size-4.5 text-emerald-600" />
            <span>Shift Handover & End Duty</span>
          </h2>
          <span className="text-[10px] text-muted-foreground">
            Cash Tally & Next Conductor Transition
          </span>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-mono">
          {activeDuty.status}
        </Badge>
      </div>

      {/* 1. SHIFT RECONCILIATION SUMMARY */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-4 space-y-3.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
          Today&apos;s Duty Collection Summary
        </span>

        {/* Big Cash Counter Card */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Total Cash to Hand Over
            </span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
              ₹{activeDuty.totalCashCollected}.00
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Verified in physical leather pouch
            </span>
          </div>

          <div className="size-12 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-600">
            <Coins className="size-6" />
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] text-muted-foreground block">Digital QRs</span>
            <span className="text-sm font-black text-foreground font-mono">{activeDuty.ticketsSoldDigital}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] text-muted-foreground block">Cash Tickets</span>
            <span className="text-sm font-black text-foreground font-mono">{activeDuty.ticketsSoldCash}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] text-muted-foreground block">Pink Free</span>
            <span className="text-sm font-black text-foreground font-mono">{activeDuty.pinkTicketsIssued}</span>
          </div>
        </div>
      </Card>

      {/* 2. HANDOVER SUBMISSION FORM */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-4 space-y-3.5">
        <form onSubmit={handleCompleteHandover} className="space-y-3.5">
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Relieving / Next Conductor Name *
              </label>
              <input
                type="text"
                required
                value={toConductor}
                onChange={(e) => setToConductor(e.target.value)}
                placeholder="e.g. Jagdish Chandra"
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Next Conductor Badge *
                </label>
                <input
                  type="text"
                  required
                  value={toBadge}
                  onChange={(e) => setToBadge(e.target.value)}
                  placeholder="DTC-C-3389"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  ETIM Machine Health
                </label>
                <select
                  value={etimStatus}
                  onChange={(e) => setEtimStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Healthy">Healthy (Battery OK)</option>
                  <option value="Paper Roll Replaced">Paper Roll Replaced</option>
                  <option value="Battery Low">Battery Low (Charge Needed)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Handover Halting Stop
              </label>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground font-bold flex items-center gap-1.5">
                <MapPin className="size-3.5 text-emerald-600" />
                <span>{currentStop.name} (Stop {currentStopIndex + 1})</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Conductor Shift Notes (Optional)
              </label>
              <input
                type="text"
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="e.g. All 184 digital QRs verified. No discrepancies."
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="size-4" />
            <span>Submit Shift Handover (₹{activeDuty.totalCashCollected})</span>
          </Button>
        </form>
      </Card>

      {/* 3. LAST COMPLETED HANDOVER RECEIPT */}
      {lastHandoverCode && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 space-y-2 animate-in zoom-in-95 duration-150 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-mono">
              <FileCheck className="size-4 text-emerald-600" />
              HANDOVER CODE #{lastHandoverCode}
            </span>
            <Badge className="bg-emerald-600 text-white font-bold text-[9px]">
              SHIFT TRANSFERRED
            </Badge>
          </div>
          <p className="text-[11px] text-foreground">
            Duty successfully handed over to <strong>{toConductor}</strong> ({toBadge}) at {currentStop.name}.
            Total cash in pouch: ₹{activeDuty.totalCashCollected}.
          </p>
        </div>
      )}

      {/* 4. PAST SHIFT HANDOVER LOGS */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Past Shift Transitions ({shiftHandovers.length})
        </span>

        <div className="space-y-2">
          {shiftHandovers.map((sh) => (
            <div
              key={sh.id}
              className="p-3 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-foreground block">
                  {sh.fromBadge} ➔ {sh.toBadge} ({sh.toConductor.split(' ')[0]})
                </span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  {sh.handoverCode} • {sh.handoverStop}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-mono block">
                  ₹{sh.cashHandedOver}
                </span>
                <Badge variant="outline" className="text-[8px]">
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
