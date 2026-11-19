'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { PassengerTicket, IndividualQrItem, DtcPass } from '@/types/dtc';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Bus,
  RotateCcw,
  Share2,
  X,
  ChevronRight,
  Check,
  Users,
  User,
  ChevronLeft,
  Lock,
  Building2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', iconBg: 'bg-[#0f9d58]', shortName: 'GPay' },
  { id: 'paytm', name: 'Paytm UPI', iconBg: 'bg-[#002e6e]', shortName: 'Paytm' },
  { id: 'phonepe', name: 'PhonePe', iconBg: 'bg-[#5f259f]', shortName: 'PhonePe' },
  { id: 'bhim', name: 'BHIM UPI', iconBg: 'bg-[#00897b]', shortName: 'BHIM' },
];

export default function PassengerTicketsPage() {
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const passes = useDtcStore((state) => state.passes);
  const passengerProfile = useDtcStore((state) => state.passengerProfile);
  const issuePinkPass = useDtcStore((state) => state.issuePinkPass);
  const issueDtcPass = useDtcStore((state) => state.issueDtcPass);
  const markTicketExpired = useDtcStore((state) => state.markTicketExpired);
  const markTicketUsed = useDtcStore((state) => state.markTicketUsed);
  const expirePass = useDtcStore((state) => state.expirePass);

  const [activeTab, setActiveTab] = useState<'active' | 'passes' | 'history'>('active');

  // Check URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'passes' || tab === 'pink') {
        setActiveTab('passes');
      } else if (tab === 'history') {
        setActiveTab('history');
      }
    }
  }, []);

  // Track active individual QR index for each ticket (ticketId -> passengerIndex 0-based)
  const [passengerIndices, setPassengerIndices] = useState<Record<string, number>>({});

  // History expanded ticket ID for viewing expired QR stamp
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Live seconds watermark clock to prevent screenshot tampering
  const [currentTime, setCurrentTime] = useState<string>('');

  // Pass purchase modal in tickets page
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const [passTypeToBuy, setPassTypeToBuy] = useState<'Daily Non-AC' | 'Daily AC'>('Daily AC');
  const [passCost, setPassCost] = useState<number>(50);
  const [passUpiApp, setPassUpiApp] = useState<string>('gpay');
  const [isProcessingPass, setIsProcessingPass] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter tickets
  const activeTickets = passengerTickets.filter(
    (t) => t.status === 'Valid' && !t.ticketNumber.startsWith('DTC-PASS') && t.fare > 0
  );

  // Combined passes list (both passTickets and store passes)
  const activePassTickets = passengerTickets.filter(
    (t) => t.ticketNumber.startsWith('DTC-PASS') || t.ticketNumber.startsWith('DTC-PINK')
  );

  const pastTickets = passengerTickets.filter((t) => t.status !== 'Valid');

  const handleIssueNewPinkTicket = () => {
    issuePinkPass('All Delhi Routes');
    toast.success('Zero-Fare Pink Ticket generated for today!');
    setActiveTab('passes');
  };

  const handleOpenBuyPassModal = (type: 'Daily Non-AC' | 'Daily AC', cost: number) => {
    setPassTypeToBuy(type);
    setPassCost(cost);
    setShowPassModal(true);
  };

  const handleExecutePassPurchase = () => {
    setIsProcessingPass(true);
    const app = UPI_APPS.find((a) => a.id === passUpiApp) || UPI_APPS[0];

    setTimeout(() => {
      const newPass = issueDtcPass({
        passType: passTypeToBuy,
        cost: passCost,
        paymentMode: `UPI (${app.name})`,
      });
      setIsProcessingPass(false);
      setShowPassModal(false);
      toast.success(
        `₹${passCost} paid via ${app.name}! ${passTypeToBuy} Pass #${newPass.passNumber} generated for today!`
      );
      setActiveTab('passes');
    }, 1200);
  };

  // Switch active passenger QR for a specific ticket
  const setPassengerForTicket = (ticketId: string, idx: number) => {
    setPassengerIndices((prev) => ({
      ...prev,
      [ticketId]: idx,
    }));
  };

  // Helper to get normalized QR list for any ticket
  const getTicketQrs = (ticket: PassengerTicket): IndividualQrItem[] => {
    if (ticket.individualQrs && ticket.individualQrs.length > 0) {
      return ticket.individualQrs;
    }
    const count = Math.max(1, ticket.passengersCount);
    return Array.from({ length: count }, (_, i) => {
      const pIdx = i + 1;
      return {
        passengerIndex: pIdx,
        passengerLabel: `Passenger ${pIdx} of ${count}`,
        passengerType: 'Adult',
        qrSerial: `${ticket.ticketNumber}-P${pIdx}`,
        qrCodeData: `${ticket.qrCodeData}-P${pIdx}`,
        fare: ticket.fare,
        status: ticket.status as 'Valid' | 'Scanned & Used' | 'Expired',
      };
    });
  };

  // Reusable Ticket Card Renderer (Supports Valid, Expired, and Scanned States)
  const renderTicketCard = (ticket: PassengerTicket, showTestingTools: boolean = true) => {
    const qrs = getTicketQrs(ticket);
    const currentIdx = passengerIndices[ticket.id] ?? 0;
    const activeQr = qrs[currentIdx] || qrs[0];
    const isMulti = qrs.length > 1;

    const isExpired = ticket.status === 'Expired' || activeQr.status === 'Expired';
    const isScanned = ticket.status === 'Scanned & Used' || activeQr.status === 'Scanned & Used';
    const isInvalid = isExpired || isScanned;

    return (
      <Card
        key={ticket.id}
        className={`shadow-md rounded-2xl overflow-hidden relative transition-all ${
          isExpired
            ? 'border-rose-500/50 bg-gradient-to-br from-card via-card to-rose-500/5'
            : isScanned
            ? 'border-amber-500/50 bg-gradient-to-br from-card via-card to-amber-500/5'
            : 'border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-500/5'
        }`}
      >
        {/* Dynamic Watermark Banner: Changes color and text based on validity */}
        {isExpired ? (
          <div className="h-7 bg-rose-700 text-white px-3 flex items-center justify-between text-[10px] font-black tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <span>❌</span>
              <span>EXPIRED TICKET • CANNOT BE REUSED</span>
            </span>
            <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-[10px]">
              {currentTime}
            </span>
          </div>
        ) : isScanned ? (
          <div className="h-7 bg-amber-700 text-white px-3 flex items-center justify-between text-[10px] font-black tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <span>🟡</span>
              <span>SCANNED & REDEEMED • SINGLE USE OVER</span>
            </span>
            <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-[10px]">
              {currentTime}
            </span>
          </div>
        ) : (
          <div className="h-7 bg-emerald-700 text-white px-3 flex items-center justify-between text-[10px] font-black tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white animate-pulse" />
              LIVE VERIFIED TICKET
            </span>
            <span className="font-mono bg-black/25 px-1.5 py-0.5 rounded text-[10px]">
              {currentTime}
            </span>
          </div>
        )}

        <CardContent className="p-4 space-y-3.5">
          {/* Journey Route & Bus Header */}
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isExpired
                    ? 'text-rose-600 dark:text-rose-400'
                    : isScanned
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {ticket.isConnecting ? 'DTC 2-Bus Transit Pass' : 'DTC Transit Pass'}
              </span>
              <h3 className="text-base font-black text-foreground">
                Route {ticket.routeNumber}
              </h3>
              {ticket.transferStop && (
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">
                  🔄 Transfer at {ticket.transferStop}
                </span>
              )}
              {!ticket.isConnecting && (
                <span className="text-[10px] text-muted-foreground block">
                  {ticket.busType}
                </span>
              )}
            </div>

            {/* Status Badge */}
            {isExpired ? (
              <Badge className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5">
                ❌ Expired
              </Badge>
            ) : isScanned ? (
              <Badge className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5">
                🟡 Scanned & Used
              </Badge>
            ) : (
              <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5">
                Valid for 2h
              </Badge>
            )}
          </div>

          {/* User-Friendly Booking Date & Time + Validity Pill Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/60 border border-border/80 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-muted-foreground text-[11px]">Booked:</span>
              <span className="font-bold text-foreground text-[11px] truncate font-mono">
                {ticket.bookedAt || 'Today, 10:30 AM'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 pl-2">
              <span className="text-muted-foreground text-[10px]">Valid Till:</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400 text-[11px] font-mono">
                {ticket.validUntil || '2 Hours'}
              </span>
            </div>
          </div>

          {/* Multi-Passenger Group Banner & Switcher */}
          {isMulti && (
            <div className="p-2.5 rounded-xl bg-muted/50 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-foreground" />
                  <span className="font-black text-foreground text-[11px]">
                    Group Booking: {qrs.length} Passengers
                  </span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-foreground text-background">
                  {qrs.length} Individual QRs
                </span>
              </div>

              {/* Horizontal Passenger Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {qrs.map((item, idx) => (
                  <button
                    key={item.qrSerial}
                    type="button"
                    onClick={() => setPassengerForTicket(ticket.id, idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                      currentIdx === idx
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <User className="size-3" />
                    <span>P{item.passengerIndex}</span>
                    {currentIdx === idx && (
                      <span className="size-1.5 rounded-full bg-emerald-300 animate-ping" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Passenger Label Banner */}
          <div className="text-center bg-muted/50 py-1.5 px-3 rounded-xl border border-border/60">
            <span className="text-xs font-black text-foreground uppercase tracking-wide">
              {isMulti ? activeQr.passengerLabel : 'Single Passenger Pass'}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground block">
              Scan Code: {activeQr.qrSerial}
            </span>
          </div>

          {/* High-Resolution Verifiable QR Code Container with INVALID / EXPIRED Stamp */}
          <div className="p-4 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-border flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            {/* PROMINENT DIAGONAL OVERLAY STAMP WHEN TICKET IS EXPIRED OR SCANNED */}
            {isInvalid && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-3">
                <div
                  className={`rotate-[-22deg] px-5 py-2.5 rounded-xl border-4 shadow-2xl backdrop-blur-xs text-center ${
                    isScanned
                      ? 'border-amber-600 bg-amber-50/95 dark:bg-amber-950/95 text-amber-900 dark:text-amber-200'
                      : 'border-rose-600 bg-rose-50/95 dark:bg-rose-950/95 text-rose-700 dark:text-rose-200'
                  }`}
                >
                  <span className="text-base font-black tracking-widest uppercase block">
                    {isScanned ? 'SCANNED & USED' : 'EXPIRED / INVALID'}
                  </span>
                  <span className="text-[9px] font-bold block mt-0.5">
                    NOT VALID FOR TRAVEL • CANNOT BE REUSED
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic SVG QR Pattern: Fades and blurs when expired */}
            <svg
              viewBox="0 0 160 160"
              className={`size-44 drop-shadow-xs transition-opacity duration-300 ${
                isInvalid ? 'opacity-20 grayscale blur-[0.6px]' : 'opacity-100'
              }`}
            >
              {/* Outer corner finder patterns */}
              <rect x="10" y="10" width="40" height="40" fill="#064e3b" rx="4" />
              <rect x="18" y="18" width="24" height="24" fill="#ffffff" rx="2" />
              <rect x="24" y="24" width="12" height="12" fill="#064e3b" />

              <rect x="110" y="10" width="40" height="40" fill="#064e3b" rx="4" />
              <rect x="118" y="18" width="24" height="24" fill="#ffffff" rx="2" />
              <rect x="124" y="24" width="12" height="12" fill="#064e3b" />

              <rect x="10" y="110" width="40" height="40" fill="#064e3b" rx="4" />
              <rect x="18" y="118" width="24" height="24" fill="#ffffff" rx="2" />
              <rect x="24" y="124" width="12" height="12" fill="#064e3b" />

              {/* Distinct pattern cells based on currentIdx */}
              <rect x="60" y="15" width="8" height="8" fill={currentIdx % 2 === 0 ? '#047857' : '#064e3b'} />
              <rect x="75" y="15" width="12" height="8" fill="#064e3b" />
              <rect x="92" y="20" width="8" height="8" fill="#047857" />
              <rect x="60" y="32" width="14" height="6" fill="#064e3b" />
              <rect x="80" y="30" width="18" height="8" fill={currentIdx === 1 ? '#047857' : '#064e3b'} />

              <rect x="15" y="60" width="10" height="10" fill="#047857" />
              <rect x="35" y="65" width="8" height="16" fill="#064e3b" />
              <rect x="15" y="80" width="14" height="8" fill="#064e3b" />
              <rect x="35" y="90" width="8" height="8" fill="#047857" />

              <rect x="115" y="60" width="12" height="8" fill="#064e3b" />
              <rect x="135" y="65" width="12" height="12" fill="#047857" />
              <rect x="115" y="80" width="8" height="14" fill="#064e3b" />
              <rect x="130" y="85" width="15" height="8" fill="#047857" />

              {/* Center DTC Emblem Shield */}
              <circle cx="80" cy="80" r="18" fill="#15803d" stroke="#fef08a" strokeWidth="2" />
              <text x="80" y="83" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle">
                DTC
              </text>
              <text x="80" y="91" fill="#fef08a" fontSize="6" fontWeight="700" textAnchor="middle">
                P{activeQr.passengerIndex}
              </text>

              {/* Bottom data dots */}
              <rect x="60" y="115" width="10" height="8" fill="#064e3b" />
              <rect x="80" y="115" width="18" height="10" fill="#047857" />
              <rect x="60" y="132" width="14" height="8" fill="#047857" />
              <rect x="82" y="132" width="16" height="12" fill="#064e3b" />
              <rect x="110" y="115" width="14" height="14" fill="#047857" />
              <rect x="130" y="125" width="16" height="12" fill="#064e3b" />
            </svg>

            <div className="text-center mt-2 space-y-0.5">
              <span className="text-[11px] font-mono font-bold text-slate-900 tracking-wider">
                {activeQr.qrSerial}
              </span>
              <p
                className={`text-[9px] font-bold ${
                  isExpired
                    ? 'text-rose-600'
                    : isScanned
                    ? 'text-amber-600'
                    : 'text-slate-500'
                }`}
              >
                {isExpired
                  ? '❌ Ticket validity expired. Re-booking required for travel.'
                  : isScanned
                  ? '⚠️ Already scanned by conductor. Cannot be accepted again.'
                  : 'Present screen to Conductor ETIM Scanner'}
              </p>
            </div>
          </div>

          {/* Multi-Passenger Previous/Next Switcher */}
          {isMulti && (
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-muted/60 border border-border">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentIdx === 0}
                onClick={() => setPassengerForTicket(ticket.id, currentIdx - 1)}
                className="h-8 px-2.5 text-xs font-bold gap-1 rounded-lg"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev QR</span>
              </Button>

              <span className="text-xs font-black text-foreground">
                {currentIdx + 1} of {qrs.length} QRs
              </span>

              <Button
                variant="ghost"
                size="sm"
                disabled={currentIdx === qrs.length - 1}
                onClick={() => setPassengerForTicket(ticket.id, currentIdx + 1)}
                className="h-8 px-2.5 text-xs font-bold gap-1 rounded-lg text-emerald-700 dark:text-emerald-400"
              >
                <span>Next QR</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Journey Details */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Booking Date & Time:</span>
              <span className="font-bold text-foreground font-mono text-[11px] flex items-center gap-1">
                <Clock className="size-3 text-emerald-600 inline shrink-0" />
                <span>{ticket.bookedAt || 'Today, 10:30 AM'}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Valid Until:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                {ticket.validUntil || 'Valid for 2 Hours'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Number:</span>
              <span className="font-bold text-foreground font-mono">{ticket.ticketNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">From:</span>
              <span className="font-bold text-foreground">{ticket.sourceStop || ticket.boardingStop}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To:</span>
              <span className="font-bold text-foreground">{ticket.destinationStop}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Passengers:</span>
              <span className="font-bold text-foreground">{ticket.passengersCount} Commuters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <span className="font-bold text-foreground font-mono">{ticket.paymentMode || 'UPI'}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border font-bold">
              <span>Total Paid:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                ₹{ticket.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Interactive Simulation / Testing Controls (Requested by User) */}
          {showTestingTools && !isInvalid && (
            <div className="p-2.5 rounded-xl bg-muted/30 border border-border/80 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-muted-foreground">Test Invalid Marking:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    markTicketUsed(ticket.id);
                    toast.info(`Ticket #${ticket.ticketNumber} marked as Scanned & Used!`);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors"
                >
                  ⚡ Simulate Scan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markTicketExpired(ticket.id);
                    toast.error(`Ticket #${ticket.ticketNumber} marked as Expired!`);
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-bold transition-colors"
                >
                  Mark Expired
                </button>
              </div>
            </div>
          )}

          {/* Re-book Action if Expired */}
          {isInvalid && (
            <Link href="/passenger" className="block w-full">
              <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9">
                Book A New Ticket
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200">
      {/* Page Title & Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">
            My Tickets & Passes
          </h2>
          <p className="text-[11px] text-muted-foreground">
            ETIM scanner verifiable digital tickets and all-route passes
          </p>
        </div>

        <button
          onClick={handleIssueNewPinkTicket}
          className="px-2.5 py-1 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-500/30 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
        >
          <Sparkles className="size-3 text-pink-600" />
          <span>+ Pink Pass</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-card text-foreground shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Active QR</span>
          {activeTickets.length > 0 && (
            <span className="size-2 rounded-full bg-emerald-600 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('passes')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'passes'
              ? 'bg-card text-emerald-700 dark:text-emerald-400 shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Bus Passes</span>
          <span className="text-[9px] px-1.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
            {passes.length + activePassTickets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'history'
              ? 'bg-card text-foreground shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>History ({pastTickets.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE TICKETS */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeTickets.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-card border border-border/70 rounded-2xl p-6">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <QrCode className="size-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">No Active Single-Journey Ticket</h4>
                <p className="text-[11px] text-muted-foreground">
                  You do not have any active single-route journeys right now.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Link href="/passenger">
                  <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl">
                    Book A Journey
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('passes')}
                  className="font-bold text-xs rounded-xl"
                >
                  View Bus Passes
                </Button>
              </div>
            </div>
          ) : (
            activeTickets.map((ticket) => renderTicketCard(ticket, true))
          )}
        </div>
      )}

      {/* TAB 2: BUS PASSES (DAILY ALL-ROUTE PASSES & WOMEN PINK PASS) */}
      {activeTab === 'passes' && (
        <div className="space-y-3.5">
          {/* Quick Buy Pass Promo Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                  Govt of NCT Delhi
                </span>
                <h3 className="text-sm font-black mt-1">DTC All-Route Bus Passes</h3>
                <p className="text-[11px] opacity-90">
                  Unlimited rides across all Delhi DTC & Cluster buses for today.
                </p>
              </div>
              <div className="size-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl">
                🎫
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleOpenBuyPassModal('Daily Non-AC', 40)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-left transition-all active:scale-98 shadow-xs"
              >
                <span className="text-[10px] font-bold block text-emerald-100">Non-AC Daily Pass</span>
                <span className="text-sm font-black block">₹40 <span className="text-[10px] font-normal opacity-80">/ Day</span></span>
                <span className="text-[9px] font-medium text-emerald-200 mt-0.5 block">Unlimited rides today</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenBuyPassModal('Daily AC', 50)}
                className="p-2.5 rounded-xl bg-white text-emerald-950 hover:bg-slate-100 border border-white text-left transition-all active:scale-98 shadow-xs"
              >
                <span className="text-[10px] font-bold block text-emerald-800">AC Electric Pass</span>
                <span className="text-sm font-black block text-emerald-950">₹50 <span className="text-[10px] font-normal text-emerald-700">/ Day</span></span>
                <span className="text-[9px] font-bold text-emerald-700 mt-0.5 block">All buses including AC</span>
              </button>
            </div>
          </div>

          {/* Women Free Pink Pass Generator Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-pink-500/15 border border-pink-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-700 dark:text-pink-300">
                Women Zero-Fare Scheme
              </span>
              <h4 className="text-xs font-black text-foreground">Pink Pass (Free for Women)</h4>
              <p className="text-[10px] text-muted-foreground">Valid on all standard & Non-AC routes</p>
            </div>
            <Button
              onClick={handleIssueNewPinkTicket}
              size="sm"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl h-8 px-3 shadow-2xs"
            >
              Get Free Pass
            </Button>
          </div>

          {/* List of Active Passes */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-black text-foreground px-1">Your Active Passes</h4>

            {passes.length === 0 && activePassTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-2xl p-4">
                No active bus passes yet. Buy a Daily Pass (₹40/₹50) or get a Free Pink Pass above.
              </div>
            ) : (
              <>
                {/* 1. Passes from `passes` state */}
                {passes.map((pass) => {
                  const isExpired = pass.status === 'Expired';

                  return (
                    <Card
                      key={pass.id}
                      className={`shadow-md rounded-2xl overflow-hidden relative transition-all ${
                        isExpired
                          ? 'border-rose-500/50 bg-gradient-to-br from-card via-card to-rose-500/5'
                          : pass.passType.includes('Pink')
                          ? 'border-pink-500/40 bg-gradient-to-br from-pink-50/20 via-card to-rose-50/20'
                          : 'border-emerald-500/40 bg-gradient-to-br from-emerald-50/20 via-card to-teal-50/20'
                      }`}
                    >
                      {/* Pass Watermark Header */}
                      <div
                        className={`h-7 px-3 flex items-center justify-between text-[10px] font-black tracking-wider uppercase text-white ${
                          isExpired
                            ? 'bg-rose-700'
                            : pass.passType.includes('Pink')
                            ? 'bg-pink-600'
                            : 'bg-emerald-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isExpired ? '❌ EXPIRED PASS' : 'DTC ALL-DELHI ROUTE PASS'}
                        </span>
                        <span className="font-mono bg-black/25 px-1.5 py-0.5 rounded text-[10px]">
                          {currentTime}
                        </span>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                              Pass Number: {pass.passNumber}
                            </span>
                            <h3 className="text-base font-black text-foreground">{pass.passType}</h3>
                            <span className="text-[10px] text-muted-foreground block">
                              Holder: {pass.holderName} • {pass.holderPhone}
                            </span>
                          </div>

                          <Badge
                            className={`font-black text-[10px] px-2.5 py-1 ${
                              isExpired
                                ? 'bg-rose-600 text-white'
                                : pass.cost === 0
                                ? 'bg-pink-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {isExpired ? 'EXPIRED' : pass.cost === 0 ? 'FREE' : `₹${pass.cost} PAID`}
                          </Badge>
                        </div>

                        {/* Pass Issued Timestamp & Validity Bar */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/60 border border-border/80 text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="text-muted-foreground text-[11px]">Issued:</span>
                            <span className="font-bold text-foreground text-[11px] truncate font-mono">
                              {pass.issuedDate || 'Today, 10:00 AM'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 pl-2">
                            <span className="text-muted-foreground text-[10px]">Valid Till:</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-400 text-[11px] font-mono">
                              Today, 11:59 PM
                            </span>
                          </div>
                        </div>

                        {/* Verifiable QR Code Container with Expiry Stamp */}
                        <div className="p-4 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-border flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                          {isExpired && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-3">
                              <div className="rotate-[-22deg] px-5 py-2.5 rounded-xl border-4 border-rose-600 bg-white/95 text-center shadow-2xl">
                                <span className="text-base font-black text-rose-700 tracking-widest uppercase block">
                                  EXPIRED / INVALID
                                </span>
                                <span className="text-[9px] font-bold text-rose-600 block mt-0.5">
                                  PASS EXPIRED • CANNOT BE REUSED
                                </span>
                              </div>
                            </div>
                          )}

                          <svg
                            viewBox="0 0 160 160"
                            className={`size-40 drop-shadow-xs transition-opacity duration-300 ${
                              isExpired ? 'opacity-20 grayscale blur-[0.6px]' : 'opacity-100'
                            }`}
                          >
                            <rect x="10" y="10" width="40" height="40" fill="#064e3b" rx="4" />
                            <rect x="18" y="18" width="24" height="24" fill="#ffffff" rx="2" />
                            <rect x="24" y="24" width="12" height="12" fill="#064e3b" />
                            <rect x="110" y="10" width="40" height="40" fill="#064e3b" rx="4" />
                            <rect x="118" y="18" width="24" height="24" fill="#ffffff" rx="2" />
                            <rect x="124" y="24" width="12" height="12" fill="#064e3b" />
                            <rect x="10" y="110" width="40" height="40" fill="#064e3b" rx="4" />
                            <rect x="18" y="118" width="24" height="24" fill="#ffffff" rx="2" />
                            <rect x="24" y="124" width="12" height="12" fill="#064e3b" />
                            <circle cx="80" cy="80" r="18" fill="#15803d" stroke="#fef08a" strokeWidth="2" />
                            <text x="80" y="83" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle">
                              DTC
                            </text>
                            <text x="80" y="91" fill="#fef08a" fontSize="6" fontWeight="700" textAnchor="middle">
                              PASS
                            </text>
                          </svg>

                          <div className="text-center mt-2 space-y-0.5">
                            <span className="text-[11px] font-mono font-bold text-slate-900 tracking-wider">
                              {pass.passNumber}
                            </span>
                            <p className="text-[9px] text-slate-500 font-medium">
                              Valid on all DTC & DIMTS Cluster Buses today
                            </p>
                          </div>
                        </div>

                        {/* Validity Footer & Test Expiry */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                          <span className="text-muted-foreground text-[11px]">
                            Validity: <strong className="text-foreground">Today till 23:59</strong>
                          </span>

                          {!isExpired && (
                            <button
                              type="button"
                              onClick={() => {
                                expirePass(pass.id);
                                toast.error(`Pass #${pass.passNumber} marked as Expired!`);
                              }}
                              className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                            >
                              Simulate Expiry
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* 2. Pass tickets from `passengerTickets` */}
                {activePassTickets.map((ticket) => renderTicketCard(ticket, true))}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY (PAST & EXPIRED TICKETS) */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {pastTickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground bg-card border border-border rounded-2xl p-4">
              No past journeys or expired tickets recorded yet.
            </div>
          ) : (
            pastTickets.map((t) => {
              const isExpanded = expandedHistoryId === t.id;

              return (
                <div
                  key={t.id}
                  className="rounded-2xl bg-card border border-border/80 shadow-2xs overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedHistoryId(isExpanded ? null : t.id)}
                    className="p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">Route {t.routeNumber}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            t.status === 'Expired'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                              : t.status === 'Scanned & Used'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {t.status === 'Expired'
                            ? '❌ Expired'
                            : t.status === 'Scanned & Used'
                            ? '🟡 Scanned & Used'
                            : t.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {t.sourceStop || t.boardingStop} ➔ {t.destinationStop}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        Booked: {t.bookedAt} • Ticket: {t.ticketNumber}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="font-bold text-foreground block">
                          {t.fare === 0 ? 'FREE' : `₹${t.totalAmount.toFixed(2)}`}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {isExpanded ? 'Hide QR' : 'View Stamp'}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded View with Full Invalid QR Stamp */}
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-border/60 bg-muted/10">
                      {renderTicketCard(t, false)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PASS PURCHASE MODAL (DIRECT UPI FLOW IN TICKETS PAGE) */}
      {showPassModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-3.5 bg-emerald-700 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xs">
                  🎫
                </div>
                <div>
                  <div className="text-xs font-black">Buy DTC Daily Bus Pass</div>
                  <div className="text-[9px] text-white/80 font-mono">Instant QR Issuance</div>
                </div>
              </div>
              {!isProcessingPass && (
                <button
                  onClick={() => setShowPassModal(false)}
                  className="size-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto">
              {isProcessingPass ? (
                <div className="py-8 text-center space-y-3">
                  <div className="size-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-foreground">Processing Pass Payment...</h4>
                    <p className="text-xs text-muted-foreground">Generating verifiable digital pass QR.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Select Pass Type */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground block">Select Pass Type:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPassTypeToBuy('Daily Non-AC');
                          setPassCost(40);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          passTypeToBuy === 'Daily Non-AC'
                            ? 'border-emerald-600 bg-emerald-500/10 font-black'
                            : 'border-border bg-card hover:bg-muted font-bold'
                        }`}
                      >
                        <span className="text-[10px] text-muted-foreground block">Non-AC Bus</span>
                        <span className="text-xs text-foreground">₹40 / Day</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPassTypeToBuy('Daily AC');
                          setPassCost(50);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          passTypeToBuy === 'Daily AC'
                            ? 'border-emerald-600 bg-emerald-500/10 font-black'
                            : 'border-border bg-card hover:bg-muted font-bold'
                        }`}
                      >
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">AC Electric + All</span>
                        <span className="text-xs text-foreground">₹50 / Day</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Holder:</span>
                      <span className="font-bold text-foreground">{passengerProfile.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Issuance Time:</span>
                      <span className="font-bold text-foreground font-mono">Today, {currentTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validity:</span>
                      <span className="font-bold text-foreground">Today till 23:59 (Midnight)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Routes:</span>
                      <span className="font-bold text-foreground">All Delhi NCR Routes</span>
                    </div>
                    <div className="pt-1.5 border-t border-border flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black text-base">
                        ₹{passCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Select UPI App */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground block">Pay With:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {UPI_APPS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setPassUpiApp(a.id)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                            passUpiApp === a.id
                              ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                              : 'border-border bg-card hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          <span className={`size-5 rounded-md ${a.iconBg} text-white flex items-center justify-center text-[10px] font-black`}>
                            {a.shortName.charAt(0)}
                          </span>
                          <span>{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Authorize & Pay Button */}
                  <Button
                    onClick={handleExecutePassPurchase}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl h-10 shadow-sm flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="size-4" />
                    <span>Authorize & Pay ₹{passCost.toFixed(2)}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
