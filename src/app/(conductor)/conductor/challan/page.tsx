'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ShieldAlert,
  AlertTriangle,
  Receipt,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Coins,
  QrCode,
  FileText,
} from 'lucide-react';

export default function ConductorChallanPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const routes = useDtcStore((state) => state.routes);
  const currentStopIndex = useDtcStore((state) => state.currentStopIndex);
  const noTicketChallans = useDtcStore((state) => state.noTicketChallans);
  const issueConductorChallan = useDtcStore((state) => state.issueConductorChallan);

  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];
  const assignedRoute = routes.find((r) => r.routeNumber === activeDuty.routeNumber) || routes[0];
  const currentStop = assignedRoute.stops[currentStopIndex] || assignedRoute.stops[0];

  // Challan Form State
  const [violatorName, setViolatorName] = useState<string>('');
  const [violatorPhone, setViolatorPhone] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [violationReason, setViolationReason] = useState<string>('Ticketless Travel (No Ticket Purchased)');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Conductor UPI QR' | 'Pending'>('Cash');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(200);
  const [fareDue, setFareDue] = useState<number>(20);
  const [lastChallan, setLastChallan] = useState<any | null>(null);

  const totalFine = penaltyAmount + fareDue;

  const handleIssueChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!violatorName.trim()) {
      toast.error('Please enter violator commuter name');
      return;
    }

    const challan = issueConductorChallan({
      violatorName,
      violatorPhone: violatorPhone || 'Not Provided',
      gender,
      violationReason,
      fineAmount: penaltyAmount,
      fareDue,
      paymentMode,
      stopName: currentStop.name,
    });

    setLastChallan(challan);
    setViolatorName('');
    setViolatorPhone('');
    toast.success(`Section 178 Challan #${challan.challanNumber} issued successfully!`);
  };

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <ShieldAlert className="size-4.5 text-amber-400" />
            <span>Section 178 Challan Desk</span>
          </h2>
          <span className="text-[10px] text-slate-400">
            Delhi Motor Vehicles Act Enforcement • Route {activeDuty.routeNumber}
          </span>
        </div>

        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-mono">
          FINE: ₹200
        </Badge>
      </div>

      {/* 1. CHALLAN ISSUANCE FORM */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl p-4 space-y-3">
        <form onSubmit={handleIssueChallan} className="space-y-3">
          {/* Passenger Name & Phone */}
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Violator Commuter Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={violatorName}
                  onChange={(e) => setViolatorName(e.target.value)}
                  placeholder="e.g. Rakesh Verma"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 font-semibold focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <input
                    type="tel"
                    value={violatorPhone}
                    onChange={(e) => setViolatorPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Violation Reason */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Violation Offence Reason
            </label>
            <select
              value={violationReason}
              onChange={(e) => setViolationReason(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-amber-500"
            >
              <option value="Ticketless Travel (No Ticket Purchased)">
                Ticketless Travel (No Ticket Purchased)
              </option>
              <option value="Duplicate / Screenshot QR Misuse">
                Duplicate / Screenshot QR Misuse
              </option>
              <option value="Over-travel (Beyond Destination Stage)">
                Over-travel (Beyond Destination Stage)
              </option>
              <option value="Wrong Bus Route / Invalid Pass">
                Wrong Bus Route / Invalid Pass
              </option>
              <option value="Tampered Physical Ticket">
                Tampered Physical Ticket
              </option>
            </select>
          </div>

          {/* Location Stop */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Detected at Stop:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <MapPin className="size-3 text-emerald-400" />
              {currentStop.name}
            </span>
          </div>

          {/* Payment Collection Mode */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Payment Collection Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMode('Cash')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  paymentMode === 'Cash'
                    ? 'bg-amber-600 text-white font-bold border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Coins className="size-3.5 mx-auto mb-1" />
                <span className="text-[11px] font-bold block">Cash (On Spot)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('Conductor UPI QR')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  paymentMode === 'Conductor UPI QR'
                    ? 'bg-amber-600 text-white font-bold border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <QrCode className="size-3.5 mx-auto mb-1" />
                <span className="text-[11px] font-bold block">UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('Pending')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  paymentMode === 'Pending'
                    ? 'bg-amber-600 text-white font-bold border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <FileText className="size-3.5 mx-auto mb-1" />
                <span className="text-[11px] font-bold block">Court Notice</span>
              </button>
            </div>
          </div>

          {/* Fine Summary & Issue Button */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Total Penalty Amount
                </span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  ₹{totalFine}.00
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                ₹{penaltyAmount} fine + ₹{fareDue} fare
              </span>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
            >
              <ShieldAlert className="size-4" />
              <span>Issue Section 178 Challan (₹{totalFine})</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. LAST ISSUED CHALLAN RECEIPT */}
      {lastChallan && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="size-4 text-emerald-400" />
              CHALLAN ISSUED #{lastChallan.challanNumber}
            </span>
            <Badge className="bg-amber-500 text-slate-950 font-bold text-[9px]">
              {lastChallan.status}
            </Badge>
          </div>

          <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div>Violator: <strong className="text-white">{lastChallan.passengerName}</strong> ({lastChallan.passengerPhone})</div>
            <div>Reason: <span className="text-amber-300">{lastChallan.notes}</span></div>
            <div>Bus: {lastChallan.busNumber} • Conductor: {lastChallan.conductorBadge}</div>
            <div className="flex justify-between font-mono pt-1 text-xs font-bold border-t border-slate-800">
              <span>Fine Collected: ₹{lastChallan.totalAmount}</span>
              <span className="text-emerald-400">{lastChallan.paymentMode}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECENT CHALLANS LOGS */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Today&apos;s Issued Challans ({noTicketChallans.length})
        </span>

        <div className="space-y-1.5">
          {noTicketChallans.slice(0, 3).map((ch) => (
            <div
              key={ch.id}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">{ch.passengerName}</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {ch.challanNumber} • {ch.locationStop}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-400 font-mono block">
                  ₹{ch.totalAmount}
                </span>
                <Badge className="text-[8px] bg-slate-800 text-slate-300">
                  {ch.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
