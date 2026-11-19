'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeftRight,
  Coins,
  QrCode,
  CheckCircle2,
  Clock,
  MapPin,
  FileCheck,
  UserCheck,
  Search,
  Building2,
  Calendar,
  Users,
} from 'lucide-react';

const RELIEVING_CONDUCTORS = [
  {
    id: 'c1',
    name: 'Jagdish Chandra Meena',
    badge: 'DTC-C-3389',
    depot: 'Sarojini Nagar Depot',
    shift: 'Evening Shift (02:00 PM - 10:00 PM)',
    phone: '+91 98112 45890',
    status: 'Ready / Standby',
  },
  {
    id: 'c2',
    name: 'Rajesh Kumar Verma',
    badge: 'DTC-C-4102',
    depot: 'Sarojini Nagar Depot',
    shift: 'Evening Shift (02:00 PM - 10:00 PM)',
    phone: '+91 98731 23410',
    status: 'Ready / Standby',
  },
  {
    id: 'c3',
    name: 'Suresh Kumar Sharma',
    badge: 'DTC-C-5120',
    depot: 'Sarojini Nagar Depot',
    shift: 'Night Shift (09:30 PM - 05:30 AM)',
    phone: '+91 99104 88721',
    status: 'Reporting Soon',
  },
  {
    id: 'c4',
    name: 'Manoj Kumar Tiwari',
    badge: 'DTC-C-2980',
    depot: 'Sarojini Nagar Depot',
    shift: 'Evening Shift (02:00 PM - 10:00 PM)',
    phone: '+91 97188 64209',
    status: 'Ready / Standby',
  },
  {
    id: 'c5',
    name: 'Sunil Dutt Pandey',
    badge: 'DTC-C-6741',
    depot: 'Sarojini Nagar Depot',
    shift: 'Evening Shift (02:00 PM - 10:00 PM)',
    phone: '+91 98109 11342',
    status: 'Ready / Standby',
  },
  {
    id: 'c6',
    name: 'Vikram Singh Negi',
    badge: 'DTC-C-1944',
    depot: 'Sarojini Nagar Depot',
    shift: 'Night Shift (09:30 PM - 05:30 AM)',
    phone: '+91 98682 99015',
    status: 'Reporting Soon',
  },
];

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

  // Selected Relieving Conductor State
  const [selectedConductorId, setSelectedConductorId] = useState<string>('c1');
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualBadge, setManualBadge] = useState<string>('');

  const [etimStatus, setEtimStatus] = useState<'Healthy' | 'Battery Low' | 'Paper Roll Replaced'>('Healthy');
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [lastHandoverCode, setLastHandoverCode] = useState<string | null>(null);

  const selectedConductor = RELIEVING_CONDUCTORS.find((c) => c.id === selectedConductorId) || RELIEVING_CONDUCTORS[0];

  const finalToConductor = isManualEntry ? manualName : selectedConductor.name;
  const finalToBadge = isManualEntry ? manualBadge : selectedConductor.badge;

  const handleCompleteHandover = (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalToConductor.trim() || !finalToBadge.trim()) {
      toast.error('Please select or specify relieving conductor name and badge number');
      return;
    }

    const handoverCode = `HND-2026-${Math.floor(100 + Math.random() * 900)}`;

    recordShiftHandover({
      fromConductor: activeDuty.conductorName,
      fromBadge: activeDuty.badgeNumber,
      toConductor: finalToConductor,
      toBadge: finalToBadge,
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
            Cash Tally & Relieving Conductor Transition
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
              Verified in physical leather cash pouch
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
            <span className="text-[10px] text-muted-foreground block">Pink Passes</span>
            <span className="text-sm font-black text-foreground font-mono">{activeDuty.pinkTicketsIssued}</span>
          </div>
        </div>
      </Card>

      {/* 2. HANDOVER SUBMISSION FORM */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-4 space-y-3.5">
        <form onSubmit={handleCompleteHandover} className="space-y-3.5">
          {/* Relieving Conductor Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-emerald-600" />
                <span>Select Relieving Conductor *</span>
              </label>

              <button
                type="button"
                onClick={() => setIsManualEntry(!isManualEntry)}
                className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
              >
                {isManualEntry ? '← Choose from Roster List' : '+ Other Conductor'}
              </button>
            </div>

            {!isManualEntry ? (
              <div className="space-y-2">
                {/* Official Conductor Dropdown */}
                <select
                  value={selectedConductorId}
                  onChange={(e) => setSelectedConductorId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  {RELIEVING_CONDUCTORS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.badge}) • {c.shift.split(' ')[0]}
                    </option>
                  ))}
                </select>

                {/* Selected Conductor Detailed Card */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-xs">
                        {selectedConductor.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">{selectedConductor.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Badge: <strong className="text-foreground">{selectedConductor.badge}</strong>
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20 text-[9px] font-bold">
                      {selectedConductor.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3 text-muted-foreground" />
                      {selectedConductor.depot}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground" />
                      {selectedConductor.shift}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback Manual Entry */
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Enter Conductor Full Name"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={manualBadge}
                    onChange={(e) => setManualBadge(e.target.value)}
                    placeholder="Enter Badge Number (e.g. DTC-C-8921)"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Machine Health & Stop */}
          <div className="grid grid-cols-2 gap-2">
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

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Handover Stop
              </label>
              <div className="h-10 px-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground font-bold flex items-center gap-1 truncate">
                <MapPin className="size-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{currentStop.name}</span>
              </div>
            </div>
          </div>

          {/* Handover Notes */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Conductor Shift Notes (Optional)
            </label>
            <input
              type="text"
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="e.g. All passenger digital QRs verified. No discrepancies."
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
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
            Duty successfully handed over to <strong>{finalToConductor}</strong> ({finalToBadge}) at {currentStop.name}.
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
