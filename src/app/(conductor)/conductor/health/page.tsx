'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Activity,
  BatteryCharging,
  Wifi,
  Receipt,
  Cpu,
  HardDrive,
  Radio,
  CheckCircle2,
  Printer,
  Scan,
  RefreshCw,
  Sparkles,
  Zap,
  Smartphone,
  ShieldCheck,
  Server,
  Play,
  RotateCcw,
  Sliders,
} from 'lucide-react';

export default function ConductorHealthPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);

  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];

  // Diagnostic Test States
  const [isRunningSelfTest, setIsRunningSelfTest] = useState<boolean>(false);
  const [selfTestStep, setSelfTestStep] = useState<number>(0);
  const [selfTestCompleted, setSelfTestCompleted] = useState<boolean>(false);

  // Printing Test Slip State
  const [isPrintingSlip, setIsPrintingSlip] = useState<boolean>(false);
  const [lastPrintedSlipTime, setLastPrintedSlipTime] = useState<string | null>(null);

  // Cloud Sync State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just Now');

  // Trigger 5-Point Automated Self-Test
  const handleRunSelfTest = () => {
    setIsRunningSelfTest(true);
    setSelfTestCompleted(false);
    setSelfTestStep(1);

    const stepInterval = setInterval(() => {
      setSelfTestStep((prev) => {
        if (prev >= 5) {
          clearInterval(stepInterval);
          setIsRunningSelfTest(false);
          setSelfTestCompleted(true);
          toast.success('ETIM Hardware Self-Test Passed (5/5 Subsystems OK)');
          return 5;
        }
        return prev + 1;
      });
    }, 700);
  };

  // Trigger Thermal Printer Test Slip
  const handlePrintTestSlip = () => {
    setIsPrintingSlip(true);
    setTimeout(() => {
      setIsPrintingSlip(false);
      const timeStr = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastPrintedSlipTime(timeStr);
      toast.success('Thermal Diagnostic Slip Printed Successfully!');
    }, 1500);
  };

  // Trigger Cloud Server Synchronization
  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Just Now');
      toast.success('ETIM data synchronized with DTC Central Depot Server!');
    }, 1000);
  };

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* 1. HEADER & OVERALL SYSTEM STATUS */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-foreground flex items-center gap-1.5">
            <Activity className="size-4.5 text-emerald-600" />
            <span>ETIM Machine Health</span>
          </h2>
          <span className="text-[10px] text-muted-foreground">
            Hardware Diagnostics • Terminal {activeDuty.etimMachineId}
          </span>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>HEALTHY 100%</span>
        </Badge>
      </div>

      {/* 2. DEVICE SPECIFICATIONS OVERVIEW CARD */}
      <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-xs rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Cpu className="size-5" />
            </div>
            <div>
              <span className="text-xs font-black text-foreground block">
                Morefun POS-600 DTC Edition
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                TransitOS v4.8.2-SEC (Android 11)
              </span>
            </div>
          </div>

          <ShieldCheck className="size-6 text-emerald-600" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/60">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">
              Machine Serial / ID
            </span>
            <span className="font-mono font-bold text-foreground">{activeDuty.etimMachineId}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">
              SAM Slot Security
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              SAM-1 & SAM-2 Active
            </span>
          </div>
        </div>
      </Card>

      {/* 3. BATTERY & THERMAL PRINTER TELEMETRY */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Battery Health Card */}
        <Card className="bg-card border-border shadow-2xs rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Battery System
            </span>
            <BatteryCharging className="size-4 text-emerald-600" />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground font-mono">92%</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Good</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground space-y-0.5 pt-1 border-t border-border/60 font-mono">
            <div className="flex justify-between">
              <span>Voltage:</span>
              <span className="text-foreground font-bold">4.18 V</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Runtime:</span>
              <span className="text-foreground font-bold">7h 35m</span>
            </div>
          </div>
        </Card>

        {/* Thermal Roll Health Card */}
        <Card className="bg-card border-border shadow-2xs rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Thermal Roll
            </span>
            <Receipt className="size-4 text-blue-600" />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground font-mono">84%</span>
              <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">~240 Slips</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground space-y-0.5 pt-1 border-t border-border/60 font-mono">
            <div className="flex justify-between">
              <span>Printhead:</span>
              <span className="text-foreground font-bold">32°C (OK)</span>
            </div>
            <div className="flex justify-between">
              <span>Paper Jam:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Clear</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. PRINTER TEST ACTION */}
      <Card className="bg-card border-border shadow-2xs rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground block">
              Thermal Printhead Diagnostic
            </span>
            <span className="text-[10px] text-muted-foreground">
              Verify thermal line density, razor cutter, and barcode sharpness
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={isPrintingSlip}
            onClick={handlePrintTestSlip}
            className="h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs shrink-0"
          >
            <Printer className="size-3.5" />
            <span>{isPrintingSlip ? 'Printing...' : 'Print Test Slip'}</span>
          </Button>
        </div>

        {lastPrintedSlipTime && (
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-900 dark:text-blue-300 flex items-center justify-between">
            <span>Last Test Slip Printed at:</span>
            <span className="font-bold">{lastPrintedSlipTime}</span>
          </div>
        )}
      </Card>

      {/* 5. PERIPHERALS & SENSORS TELEMETRY LIST */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-3.5 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
          Hardware Peripherals & Sensors
        </span>

        <div className="space-y-2 text-xs">
          {/* 2D Laser Scanner */}
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="size-4 text-emerald-600" />
              <div>
                <span className="font-bold text-foreground block">2D Laser Optical Scanner</span>
                <span className="text-[10px] text-muted-foreground">60 fps High Speed Sensor</span>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[9px] font-bold">
              CALIBRATED
            </Badge>
          </div>

          {/* Contactless NFC & RuPay Reader */}
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-600" />
              <div>
                <span className="font-bold text-foreground block">NFC / Contactless Card Reader</span>
                <span className="text-[10px] text-muted-foreground">ISO/IEC 14443 Type A/B & RuPay</span>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[9px] font-bold">
              READY
            </Badge>
          </div>

          {/* GPS Receiver */}
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-purple-600" />
              <div>
                <span className="font-bold text-foreground block">GPS / NavIC Satellite Module</span>
                <span className="text-[10px] text-muted-foreground">14 Satellites Locked • Accuracy 2.1m</span>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[9px] font-bold">
              LOCKED
            </Badge>
          </div>

          {/* 4G Private LTE APN */}
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="size-4 text-emerald-600" />
              <div>
                <span className="font-bold text-foreground block">4G LTE Transit APN</span>
                <span className="text-[10px] text-muted-foreground">Airtel M2M APN (-66 dBm Excellent)</span>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[9px] font-bold">
              CONNECTED
            </Badge>
          </div>
        </div>
      </Card>

      {/* 6. AUTOMATED 5-POINT HARDWARE SELF-TEST */}
      <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border-border shadow-xs rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-emerald-600" />
              <span>Automated 5-Point Self-Test</span>
            </h3>
            <span className="text-[10px] text-muted-foreground">
              Executes full diagnostics on Flash, Laser, GPS, SAM, and Server
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={isRunningSelfTest}
            onClick={handleRunSelfTest}
            className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs"
          >
            <Play className="size-3.5" />
            <span>{isRunningSelfTest ? 'Testing...' : 'Run Self-Test'}</span>
          </Button>
        </div>

        {/* Test Progress Step Indicators */}
        {(isRunningSelfTest || selfTestCompleted) && (
          <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span>1. Flash Storage & Memory Check:</span>
              {selfTestStep >= 1 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> PASSED
                </span>
              ) : (
                <span className="text-muted-foreground font-mono">Waiting...</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span>2. Optical 2D Laser Sensor:</span>
              {selfTestStep >= 2 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> PASSED
                </span>
              ) : (
                <span className="text-muted-foreground font-mono">Waiting...</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span>3. GPS NavIC Satellite Position Fix:</span>
              {selfTestStep >= 3 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> PASSED
                </span>
              ) : (
                <span className="text-muted-foreground font-mono">Waiting...</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span>4. Contactless SAM Transit Chip:</span>
              {selfTestStep >= 4 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> PASSED
                </span>
              ) : (
                <span className="text-muted-foreground font-mono">Waiting...</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span>5. DTC Central Server Ping (32ms):</span>
              {selfTestStep >= 5 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> PASSED
                </span>
              ) : (
                <span className="text-muted-foreground font-mono">Waiting...</span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 7. CENTRAL CLOUD SERVER SYNC */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-emerald-600" />
            <div>
              <span className="text-xs font-bold text-foreground block">
                Central Depot Cloud Sync
              </span>
              <span className="text-[10px] text-muted-foreground">
                Last synced: <strong className="text-foreground">{lastSyncTime}</strong> • 0 Pending
              </span>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSyncing}
            onClick={handleForceSync}
            className="h-8 rounded-xl border-border bg-muted/40 hover:bg-muted text-foreground font-bold text-[11px] flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Force Sync'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
