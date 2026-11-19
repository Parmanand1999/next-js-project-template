'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent } from '@/components/ui/card';
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
  Scan,
  Camera,
  X,
  Zap,
  Sparkles,
  Smartphone,
  RefreshCw,
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

  // UPI QR & Scanner Modal State
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [upiModalTab, setUpiModalTab] = useState<'qr' | 'scanner'>('qr');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedUtr, setScannedUtr] = useState<string | null>(null);

  const totalFine = penaltyAmount + fareDue;

  // Handle Form Submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!violatorName.trim()) {
      toast.error('Please enter violator commuter name');
      return;
    }

    if (paymentMode === 'Conductor UPI QR') {
      // Open UPI QR & Optical Scanner Modal
      setIsUpiModalOpen(true);
      return;
    }

    // Direct Cash or Pending Court Notice Issuance
    finalizeChallan(paymentMode);
  };

  // Finalize Challan Execution
  const finalizeChallan = (finalMode: 'Cash' | 'Conductor UPI QR' | 'Pending', utr?: string) => {
    const challanNotes = utr
      ? `${violationReason} [NPCI UPI UTR: ${utr}]`
      : violationReason;

    const challan = issueConductorChallan({
      violatorName,
      violatorPhone: violatorPhone || 'Not Provided',
      gender,
      violationReason: challanNotes,
      fineAmount: penaltyAmount,
      fareDue,
      paymentMode: finalMode,
      stopName: currentStop.name,
    });

    setLastChallan(challan);
    setViolatorName('');
    setViolatorPhone('');
    setIsUpiModalOpen(false);
    setScannedUtr(null);

    toast.success(`Section 178 Challan #${challan.challanNumber} issued successfully!`);
  };

  // Simulate Optical Scanner Verification
  const handlePerformOpticalScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const generatedUtr = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      setScannedUtr(generatedUtr);
      setIsScanning(false);
      toast.success(`Commuter Payment Verified! UTR: ${generatedUtr}`);
      
      setTimeout(() => {
        finalizeChallan('Conductor UPI QR', generatedUtr);
      }, 700);
    }, 1200);
  };

  // Simulate Commuter QR Payment
  const handleSimulateCommuterPayment = () => {
    const generatedUtr = `NPCI${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    toast.success(`Payment of ₹${totalFine}.00 received via BHIM UPI!`);
    finalizeChallan('Conductor UPI QR', generatedUtr);
  };

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-foreground flex items-center gap-1.5">
            <ShieldAlert className="size-4.5 text-amber-600" />
            <span>Section 178 Challan Desk</span>
          </h2>
          <span className="text-[10px] text-muted-foreground">
            Delhi Motor Vehicles Act Enforcement • Route {activeDuty.routeNumber}
          </span>
        </div>

        <Badge className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20 text-[10px] font-mono font-bold">
          FINE: ₹{penaltyAmount}
        </Badge>
      </div>

      {/* 1. CHALLAN ISSUANCE FORM */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-4 space-y-3.5">
        <form onSubmit={handleSubmitForm} className="space-y-3.5">
          {/* Passenger Name & Phone */}
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Violator Commuter Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={violatorName}
                  onChange={(e) => setViolatorName(e.target.value)}
                  placeholder="e.g. Rakesh Verma"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={violatorPhone}
                    onChange={(e) => setViolatorPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Violation Offence Reason
            </label>
            <select
              value={violationReason}
              onChange={(e) => setViolationReason(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500"
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
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground text-[10px]">Detected at Stop:</span>
            <span className="font-bold text-foreground flex items-center gap-1">
              <MapPin className="size-3.5 text-emerald-600" />
              {currentStop.name}
            </span>
          </div>

          {/* Payment Collection Mode */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Payment Collection Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('Cash')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMode === 'Cash'
                    ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                <Coins className="size-4 mx-auto mb-1" />
                <span className="text-[11px] font-bold block">Cash (On Spot)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('Conductor UPI QR')}
                className={`p-2.5 rounded-xl border text-center transition-all relative ${
                  paymentMode === 'Conductor UPI QR'
                    ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                <QrCode className="size-4 mx-auto mb-1" />
                <span className="text-[11px] font-bold block">UPI QR / Scanner</span>
                <span className="text-[8px] block opacity-80 font-mono">Instant Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('Pending')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMode === 'Pending'
                    ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                <FileText className="size-4 mx-auto mb-1" />
                <span className="text-[11px] font-bold block">Court Notice</span>
              </button>
            </div>
          </div>

          {/* Fine Summary & Issue Button */}
          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Total Penalty Amount
                </span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono">
                  ₹{totalFine}.00
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                ₹{penaltyAmount} fine + ₹{fareDue} fare
              </span>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
            >
              {paymentMode === 'Conductor UPI QR' ? (
                <>
                  <Scan className="size-4" />
                  <span>Open UPI QR & Scanner (₹{totalFine})</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="size-4" />
                  <span>Issue Section 178 Challan (₹{totalFine})</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. LAST ISSUED CHALLAN RECEIPT */}
      {lastChallan && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 space-y-2.5 animate-in zoom-in-95 duration-150 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="size-4 text-emerald-600" />
              CHALLAN ISSUED #{lastChallan.challanNumber}
            </span>
            <Badge className="bg-amber-600 text-white font-bold text-[9px]">
              {lastChallan.status}
            </Badge>
          </div>

          <div className="text-[11px] text-foreground space-y-1 bg-card p-3 rounded-xl border border-border shadow-2xs">
            <div>Violator: <strong className="text-foreground">{lastChallan.passengerName}</strong> ({lastChallan.passengerPhone})</div>
            <div>Reason: <span className="text-amber-700 dark:text-amber-400 font-semibold">{lastChallan.notes}</span></div>
            <div>Bus: {lastChallan.busNumber} • Conductor: {lastChallan.conductorBadge}</div>
            <div className="flex justify-between font-mono pt-1 text-xs font-bold border-t border-border mt-1.5">
              <span>Fine Collected: ₹{lastChallan.totalAmount}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{lastChallan.paymentMode}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECENT CHALLANS LOGS */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Today&apos;s Issued Challans ({noTicketChallans.length})
        </span>

        <div className="space-y-2">
          {noTicketChallans.slice(0, 3).map((ch) => (
            <div
              key={ch.id}
              className="p-3 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-foreground block">{ch.passengerName}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  {ch.challanNumber} • {ch.locationStop}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 font-mono block">
                  ₹{ch.totalAmount}
                </span>
                <Badge variant="outline" className="text-[8px]">
                  {ch.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MODAL: ETIM DYNAMIC UPI QR & OPTICAL SCANNER */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5" />
                <div>
                  <h3 className="text-xs font-black tracking-tight">ETIM UPI Fine Collector</h3>
                  <span className="text-[10px] text-amber-100 font-mono">
                    Fine: ₹{totalFine}.00 • {violatorName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUpiModalOpen(false)}
                className="size-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* View Switcher Tabs: Show QR vs Optical Scanner */}
            <div className="grid grid-cols-2 p-1 bg-muted/60 border-b border-border text-xs font-bold">
              <button
                type="button"
                onClick={() => setUpiModalTab('qr')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  upiModalTab === 'qr'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <QrCode className="size-4 text-amber-600" />
                <span>Show UPI QR</span>
              </button>
              <button
                type="button"
                onClick={() => setUpiModalTab('scanner')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  upiModalTab === 'scanner'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Camera className="size-4 text-emerald-600" />
                <span>Optical Scanner</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto">
              {upiModalTab === 'qr' ? (
                /* TAB 1: BHARAT UPI QR CODE DISPLAY */
                <div className="text-center space-y-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border-2 border-dashed border-amber-500/40 rounded-2xl inline-block shadow-inner">
                    {/* Dynamic UPI QR Code Pattern */}
                    <div className="relative size-44 mx-auto flex items-center justify-center bg-white rounded-xl p-1.5">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-slate-900"
                        fill="currentColor"
                      >
                        {/* Corner Top-Left */}
                        <path d="M5,5 h30 v30 h-30 z M11,11 v18 h18 v-18 z M15,15 h10 v10 h-10 z" />
                        {/* Corner Top-Right */}
                        <path d="M65,5 h30 v30 h-30 z M71,11 v18 h18 v-18 z M75,15 h10 v10 h-10 z" />
                        {/* Corner Bottom-Left */}
                        <path d="M5,65 h30 v30 h-30 z M11,71 v18 h18 v-18 z M15,75 h10 v10 h-10 z" />
                        {/* Data Matrix Dots */}
                        <rect x="42" y="8" width="6" height="6" />
                        <rect x="52" y="8" width="6" height="6" />
                        <rect x="42" y="20" width="6" height="6" />
                        <rect x="8" y="42" width="6" height="6" />
                        <rect x="20" y="42" width="6" height="6" />
                        <rect x="8" y="52" width="6" height="6" />
                        <rect x="42" y="42" width="16" height="16" rx="3" className="fill-amber-600" />
                        <rect x="65" y="45" width="6" height="6" />
                        <rect x="75" y="55" width="6" height="6" />
                        <rect x="85" y="45" width="6" height="6" />
                        <rect x="45" y="68" width="6" height="6" />
                        <rect x="55" y="78" width="6" height="6" />
                        <rect x="68" y="68" width="6" height="6" />
                        <rect x="80" y="78" width="6" height="6" />
                        <rect x="88" y="88" width="6" height="6" />
                        <rect x="68" y="88" width="6" height="6" />
                      </svg>

                      {/* Center DTC Seal Emblem */}
                      <div className="absolute inset-0 m-auto size-10 rounded-full bg-amber-600 text-white font-black text-[9px] flex flex-col items-center justify-center border-2 border-white shadow-md">
                        <span>DTC</span>
                        <span className="text-[6px] tracking-tighter uppercase font-mono">FINE</span>
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        UPI ID: dtc.fine.etim9412@sbi
                      </span>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400 font-mono">
                        AMOUNT: ₹{totalFine}.00
                      </span>
                    </div>
                  </div>

                  {/* Payment Waiting Status */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2">
                    <span className="size-2 rounded-full bg-amber-600 animate-ping" />
                    <span className="font-semibold text-[11px]">
                      Waiting for passenger to scan & pay from GPay / Paytm...
                    </span>
                  </div>

                  {/* Simulate Instant Payment Action */}
                  <Button
                    type="button"
                    onClick={handleSimulateCommuterPayment}
                    className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Sparkles className="size-4" />
                    <span>Confirm Received ₹{totalFine}.00</span>
                  </Button>
                </div>
              ) : (
                /* TAB 2: OPTICAL VIEWFINDER SCANNER */
                <div className="space-y-3 text-center">
                  <div className="relative w-full aspect-square max-w-[220px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/60 shadow-xl flex items-center justify-center">
                    {/* Viewfinder Corner Overlays */}
                    <div className="absolute top-2 left-2 size-5 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-2 right-2 size-5 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-2 left-2 size-5 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-2 right-2 size-5 border-b-2 border-r-2 border-emerald-400" />

                    {/* Animated Laser Scanning Line */}
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce shadow-[0_0_12px_#34d399]" />

                    {/* Simulated Phone Screen in Camera */}
                    <div className="size-28 rounded-xl border border-white/20 bg-slate-900/80 flex flex-col items-center justify-center p-2 text-white/80 space-y-1">
                      <Smartphone className="size-6 text-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-center leading-tight">
                        Aim at commuter&apos;s UPI screen / UTR QR
                      </span>
                    </div>

                    {isScanning && (
                      <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-1">
                        <RefreshCw className="size-6 animate-spin text-emerald-400" />
                        <span className="text-[10px] font-bold">Decoding UPI Receipt...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-foreground block">
                      ETIM 2D Optical Laser Active
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Align the red/green crosshairs with commuter&apos;s Google Pay or Paytm payment screen.
                    </span>
                  </div>

                  {/* Trigger Scan Button */}
                  <Button
                    type="button"
                    disabled={isScanning}
                    onClick={handlePerformOpticalScan}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <Scan className="size-4.5" />
                    <span>{isScanning ? 'Verifying UTR...' : 'Scan Commuter Phone Screen'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
