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
  Scan,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Camera,
  RotateCcw,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';

export default function ConductorScanPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const verifyPassengerQr = useDtcStore((state) => state.verifyPassengerQr);

  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];

  const [scanInput, setScanInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    status: 'VALID' | 'ALREADY_USED' | 'INVALID_ROUTE' | 'EXPIRED' | 'NOT_FOUND';
    ticket?: any;
    qrItem?: any;
    message: string;
    timestamp: string;
  } | null>(null);

  // Trigger QR Verification
  const handlePerformVerification = (codeToVerify: string) => {
    if (!codeToVerify.trim()) {
      toast.error('Please enter or select a passenger QR code to verify');
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      const res = verifyPassengerQr(codeToVerify);
      setLastResult(res);
      setIsScanning(false);

      if (res.status === 'VALID') {
        toast.success(res.message);
      } else if (res.status === 'ALREADY_USED') {
        toast.error(res.message);
      } else {
        toast.warning(res.message);
      }
    }, 450);
  };

  // Quick Preset Simulator
  const handleSelectPresetQr = (qrSerial: string) => {
    setScanInput(qrSerial);
    handlePerformVerification(qrSerial);
  };

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-foreground flex items-center gap-1.5">
            <QrCode className="size-4.5 text-emerald-600" />
            <span>Passenger Ticket Validator</span>
          </h2>
          <span className="text-[10px] text-muted-foreground">
            Validating on Route {activeDuty.routeNumber} ({activeDuty.busNumber})
          </span>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-mono">
          SCANNER ACTIVE
        </Badge>
      </div>

      {/* 1. CAMERA VIEWFINDER SIMULATOR */}
      <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden relative p-2">
        <div className="relative aspect-4/3 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
          {/* Animated Laser Scanning Line */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse" />

          {/* Viewfinder Target Corners */}
          <div className="size-44 border-2 border-emerald-500/40 rounded-2xl relative flex flex-col items-center justify-center p-3">
            <div className="absolute -top-1 -left-1 size-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 size-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 size-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 size-5 border-b-3 border-r-3 border-emerald-400 rounded-br-lg" />

            <Camera className="size-9 text-emerald-400/50 mb-2 animate-bounce" />
            <span className="text-[11px] font-bold text-slate-200 text-center">
              Align Passenger QR inside frame
            </span>
            <span className="text-[9px] text-slate-400 text-center font-mono mt-0.5">
              Multi-QR Auto-Detection
            </span>
          </div>

          {/* Quick Scanner Overlay Status */}
          <div className="absolute bottom-2.5 inset-x-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>DEVICE CAMERA 1</span>
            <span>FPS: 30 • AUTO-FOCUS ON</span>
          </div>
        </div>
      </Card>

      {/* 2. INSTANT SCAN SIMULATOR BAR (Commuters presenting QR in bus) */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-500" />
            Commuters Boarding Now (Simulate QR Scan)
          </span>
          <span className="text-[9px] text-muted-foreground font-medium">Tap to Scan</span>
        </div>

        {/* Quick Commuter Ticket Selection Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {passengerTickets.slice(0, 5).map((t) => {
            const qrSerial = t.individualQrs?.[0]?.qrSerial || t.ticketNumber;
            const isScanned = t.individualQrs?.[0]?.status === 'Scanned & Used';

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectPresetQr(qrSerial)}
                className={`px-3 py-2 rounded-xl text-left border shrink-0 transition-all text-xs ${
                  isScanned
                    ? 'bg-muted/40 border-border text-muted-foreground'
                    : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span>{t.passengerName?.split(' ')[0] || 'Commuter'}</span>
                  <Badge variant="outline" className="text-[8px] px-1 py-0">
                    Rt {t.routeNumber}
                  </Badge>
                </div>
                <span className="text-[9px] opacity-75 block font-mono mt-0.5">
                  {qrSerial.slice(-8)} {isScanned ? '(Used)' : '(New)'}
                </span>
              </button>
            );
          })}

          {/* Preset to Test Fraudulent Already-Used QR */}
          <button
            type="button"
            onClick={() => handleSelectPresetQr('DTC-QR-2026-90812-P1')}
            className="px-3 py-2 rounded-xl text-left border shrink-0 transition-all text-xs bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
          >
            <div className="flex items-center gap-1 font-bold">
              <span>⚠️ Test Duplicate QR</span>
            </div>
            <span className="text-[9px] opacity-75 block mt-0.5">Simulate Fraud Reuse</span>
          </button>
        </div>

        {/* Manual Barcode / Serial Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="Or type/paste QR barcode data..."
            className="flex-1 h-10 px-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handlePerformVerification(scanInput)}
            disabled={isScanning}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <span>{isScanning ? 'Verifying...' : 'Validate'}</span>
          </Button>
        </div>
      </Card>

      {/* 3. VERIFICATION RESULT DISPLAY */}
      {lastResult && (
        <Card
          className={`rounded-2xl border p-4 space-y-3.5 animate-in zoom-in-95 duration-150 shadow-xs ${
            lastResult.status === 'VALID'
              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
              : lastResult.status === 'ALREADY_USED'
              ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800'
              : 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800'
          }`}
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lastResult.status === 'VALID' ? (
                <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
              ) : lastResult.status === 'ALREADY_USED' ? (
                <XCircle className="size-6 text-rose-600 shrink-0 animate-pulse" />
              ) : (
                <AlertTriangle className="size-6 text-amber-600 shrink-0" />
              )}
              <div>
                <h3 className="text-sm font-black text-foreground">
                  {lastResult.status === 'VALID'
                    ? 'TICKET VERIFIED • AUTHORIZED'
                    : lastResult.status === 'ALREADY_USED'
                    ? 'FRAUD ALERT: TICKET ALREADY USED'
                    : 'INVALID TICKET / MISMATCH'}
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Scanned At: {lastResult.timestamp}
                </span>
              </div>
            </div>

            <Badge
              className={`text-[10px] font-mono font-bold ${
                lastResult.status === 'VALID'
                  ? 'bg-emerald-600 text-white'
                  : lastResult.status === 'ALREADY_USED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {lastResult.status}
            </Badge>
          </div>

          {/* Ticket Information */}
          {lastResult.ticket && (
            <div className="p-3.5 rounded-xl bg-card border border-border space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium">Passenger</span>
                  <strong className="text-foreground font-bold">{lastResult.ticket.passengerName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block font-medium">Fare Paid</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-black">
                    {lastResult.ticket.fare === 0 ? 'FREE PINK PASS' : `₹${lastResult.ticket.fare}`}
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <div className="text-foreground">
                  <span className="text-muted-foreground">From: </span>
                  <strong>{lastResult.ticket.sourceStop || lastResult.ticket.boardingStop}</strong>
                </div>
                <ArrowRight className="size-3 text-muted-foreground" />
                <div className="text-foreground">
                  <span className="text-muted-foreground">To: </span>
                  <strong>{lastResult.ticket.destinationStop}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 font-mono border-t border-border/80">
                <span>QR Serial: {lastResult.qrItem?.qrSerial || lastResult.ticket.ticketNumber}</span>
                <span>Route: {lastResult.ticket.routeNumber}</span>
              </div>
            </div>
          )}

          {/* Advisory message */}
          <p className="text-[11px] text-foreground font-medium leading-snug">
            {lastResult.message}
          </p>

          {/* Action Trigger for Violations */}
          {lastResult.status === 'ALREADY_USED' && (
            <div className="pt-1">
              <Link href="/conductor/challan" className="block">
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl h-10 flex items-center justify-center gap-1.5 shadow-xs">
                  <ShieldAlert className="size-4" />
                  <span>Issue ₹200 Penalty Challan</span>
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
