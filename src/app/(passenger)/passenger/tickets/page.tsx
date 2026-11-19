'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { PassengerTicket, IndividualQrItem, DtcPass } from '@/types/dtc';
import { Card, CardContent } from '@/components/ui/card';
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
  X,
  ChevronRight,
  Check,
  Users,
  User,
  ChevronLeft,
  Lock,
  Building2,
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

  // Check if ticket is automatically expired (2-hour validity exceeded)
  const isTicketExpired = (ticket: PassengerTicket): boolean => {
    if (ticket.status === 'Expired' || ticket.status === 'Refunded') return true;

    // Check if 2 hours have passed since booking
    if (ticket.expiryTimestamp && Date.now() > ticket.expiryTimestamp) {
      return true;
    }

    // Fallback for older tickets in localStorage without expiryTimestamp
    const num = parseInt(ticket.id.replace(/\D/g, ''));
    if (!isNaN(num) && num > 1700000000000) {
      if (Date.now() - num > 2 * 60 * 60 * 1000) {
        return true;
      }
    }

    return false;
  };

  // Clean formatted booking time (never raw "Just Now")
  const formatTicketTime = (t: PassengerTicket) => {
    if (t.bookedAt && t.bookedAt !== 'Just Now' && t.bookedAt !== 'Today') {
      return t.bookedAt.replace(/Today \([^)]+\),? ?/, '');
    }
    const num = parseInt(t.id.replace(/\D/g, ''));
    if (!isNaN(num) && num > 1700000000000) {
      return new Date(num).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return '11:30 AM';
  };

  // Clean formatted validity expiry time
  const formatTicketExpiry = (t: PassengerTicket) => {
    if (t.validUntil && t.validUntil !== 'Valid for 2 Hours' && !t.validUntil.includes('Valid for 2')) {
      return t.validUntil.replace(/Today,? ?/, '');
    }
    const num = parseInt(t.id.replace(/\D/g, ''));
    if (!isNaN(num) && num > 1700000000000) {
      const exp = new Date(num + 2 * 60 * 60 * 1000);
      return exp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' (2h)';
    }
    return '01:30 PM (2h)';
  };

  // Filter tickets: Tickets older than 2 hours automatically go to History
  const activeTickets = passengerTickets.filter(
    (t) => !isTicketExpired(t) && t.status === 'Valid' && !t.ticketNumber.startsWith('DTC-PASS') && t.fare > 0
  );

  // Combined passes list (both passTickets and store passes)
  const activePassTickets = passengerTickets.filter(
    (t) => t.ticketNumber.startsWith('DTC-PASS') || t.ticketNumber.startsWith('DTC-PINK')
  );

  const pastTickets = passengerTickets.filter(
    (t) => isTicketExpired(t) || t.status !== 'Valid'
  );

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

  // Reusable Ultra-Compact Ticket Card (Single Time Display, Auto 2h Expiry, Reduced Space)
  const renderTicketCard = (ticket: PassengerTicket) => {
    const qrs = getTicketQrs(ticket);
    const currentIdx = passengerIndices[ticket.id] ?? 0;
    const activeQr = qrs[currentIdx] || qrs[0];
    const isMulti = qrs.length > 1;

    const isExpired = isTicketExpired(ticket);
    const isScanned = ticket.status === 'Scanned & Used' || activeQr.status === 'Scanned & Used';
    const isInvalid = isExpired || isScanned;

    const bookedTime = formatTicketTime(ticket);
    const expiryTime = formatTicketExpiry(ticket);

    return (
      <Card
        key={ticket.id}
        className={`shadow-xs rounded-2xl overflow-hidden relative transition-all ${
          isExpired
            ? 'border-rose-500/40 bg-gradient-to-br from-card via-card to-rose-500/5'
            : isScanned
            ? 'border-amber-500/40 bg-gradient-to-br from-card via-card to-amber-500/5'
            : 'border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-500/5'
        }`}
      >
        {/* Anti-tampering Watermark Header */}
        <div
          className={`h-6 px-3 flex items-center justify-between text-[10px] font-black tracking-wider uppercase text-white ${
            isExpired ? 'bg-rose-700' : isScanned ? 'bg-amber-700' : 'bg-emerald-700'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {isExpired ? (
              <>❌ EXPIRED TICKET</>
            ) : isScanned ? (
              <>🟡 SCANNED & REDEEMED</>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                LIVE VERIFIED TICKET
              </>
            )}
          </span>
          <span className="font-mono bg-black/25 px-1.5 py-0.2 rounded text-[9px]">
            {currentTime}
          </span>
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Header Row: Route, Stops, Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-foreground leading-tight">
                  Route {ticket.routeNumber}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                  {ticket.busType}
                </span>
              </div>
              <p className="text-xs font-bold text-foreground truncate max-w-[210px] mt-0.5">
                {ticket.sourceStop || ticket.boardingStop} ➔ {ticket.destinationStop}
              </p>
            </div>

            <Badge
              className={`text-[9px] font-bold px-2 py-0.5 shrink-0 ${
                isExpired
                  ? 'bg-rose-600 text-white'
                  : isScanned
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isExpired ? '❌ Expired' : isScanned ? '🟡 Used' : 'Valid 2h'}
            </Badge>
          </div>

          {/* Multi-Passenger Switcher Tabs ONLY IF MULTI COMMUTERS */}
          {isMulti && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {qrs.map((item, idx) => (
                <button
                  key={item.qrSerial}
                  type="button"
                  onClick={() => setPassengerForTicket(ticket.id, idx)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all ${
                    currentIdx === idx
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <User className="size-2.5" />
                  <span>P{item.passengerIndex}</span>
                </button>
              ))}
            </div>
          )}

          {/* Compact QR Code Container with Centered Expiry Stamp */}
          <div className="p-2 rounded-xl bg-white text-slate-900 border border-border/80 flex flex-col items-center justify-center relative overflow-hidden shadow-2xs">
            {isInvalid && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-2">
                <div
                  className={`rotate-[-18deg] px-3.5 py-1.5 rounded-lg border-2 shadow-xl backdrop-blur-xs text-center ${
                    isScanned
                      ? 'border-amber-600 bg-amber-50/95 text-amber-900'
                      : 'border-rose-600 bg-rose-50/95 text-rose-700'
                  }`}
                >
                  <span className="text-xs font-black tracking-widest uppercase block">
                    {isScanned ? 'SCANNED & USED' : 'EXPIRED / INVALID'}
                  </span>
                  <span className="text-[8px] font-bold block">
                    CANNOT BE REUSED
                  </span>
                </div>
              </div>
            )}

            {/* Compact SVG QR: size-32 (128px) */}
            <svg
              viewBox="0 0 160 160"
              className={`size-32 drop-shadow-2xs transition-opacity duration-200 ${
                isInvalid ? 'opacity-20 grayscale blur-[0.5px]' : 'opacity-100'
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
              <circle cx="80" cy="80" r="16" fill="#15803d" stroke="#fef08a" strokeWidth="2" />
              <text x="80" y="83" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle">
                DTC
              </text>
              <text x="80" y="90" fill="#fef08a" fontSize="5" fontWeight="700" textAnchor="middle">
                P{activeQr.passengerIndex}
              </text>
              <rect x="60" y="115" width="10" height="8" fill="#064e3b" />
              <rect x="80" y="115" width="18" height="10" fill="#047857" />
              <rect x="60" y="132" width="14" height="8" fill="#047857" />
              <rect x="82" y="132" width="16" height="12" fill="#064e3b" />
              <rect x="110" y="115" width="14" height="14" fill="#047857" />
              <rect x="130" y="125" width="16" height="12" fill="#064e3b" />
            </svg>

            <div className="text-center mt-1">
              <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider">
                {activeQr.qrSerial}
              </span>
              <p className="text-[8px] text-slate-500 font-medium">
                {isInvalid ? '❌ Inactive QR' : 'Present screen to Conductor ETIM Scanner'}
              </p>
            </div>
          </div>

          {/* Compact Journey Summary - NO DUPLICATE TIME, ALL INFO IN 1 COMPACT BOX */}
          <div className="p-2 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 text-emerald-600" />
                <span>Time & Validity:</span>
              </span>
              <span className="font-bold text-foreground font-mono">
                {bookedTime} • Till {expiryTime}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Commuters & Fare:</span>
              <span className="font-bold text-foreground">
                {ticket.passengersCount} Commuter{ticket.passengersCount > 1 ? 's' : ''} •{' '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-black">
                  ₹{ticket.totalAmount.toFixed(2)}
                </strong>{' '}
                ({ticket.paymentMode || 'UPI'})
              </span>
            </div>

            <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-0.5 border-t border-border/50 font-mono">
              <span>Ticket #{ticket.ticketNumber}</span>
              {ticket.transferStop && (
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  🔄 Transfer: {ticket.transferStop}
                </span>
              )}
            </div>
          </div>

          {/* Re-book Button ONLY if Expired */}
          {isInvalid && (
            <Link href="/passenger" className="block w-full pt-0.5">
              <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-8">
                Book A New Ticket
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-3.5 animate-in fade-in duration-200">
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
        <div className="space-y-3">
          {activeTickets.length === 0 ? (
            <div className="py-10 text-center space-y-3 bg-card border border-border/70 rounded-2xl p-6">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <QrCode className="size-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">No Active Single-Journey Ticket</h4>
                <p className="text-[11px] text-muted-foreground">
                  You do not have any active journeys right now.
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
            activeTickets.map((ticket) => renderTicketCard(ticket))
          )}
        </div>
      )}

      {/* TAB 2: BUS PASSES (DAILY ALL-ROUTE PASSES & WOMEN PINK PASS) */}
      {activeTab === 'passes' && (
        <div className="space-y-3">
          {/* Quick Buy Pass Promo Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                  Govt of NCT Delhi
                </span>
                <h3 className="text-xs font-black mt-0.5">DTC All-Route Bus Passes</h3>
                <p className="text-[10px] opacity-90">
                  Unlimited rides on all Delhi buses for today.
                </p>
              </div>
              <div className="size-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-base">
                🎫
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleOpenBuyPassModal('Daily Non-AC', 40)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-left transition-all active:scale-98 shadow-2xs"
              >
                <span className="text-[9px] font-bold block text-emerald-100">Non-AC Daily Pass</span>
                <span className="text-xs font-black block">₹40 <span className="text-[9px] font-normal opacity-80">/ Day</span></span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenBuyPassModal('Daily AC', 50)}
                className="p-2 rounded-xl bg-white text-emerald-950 hover:bg-slate-100 border border-white text-left transition-all active:scale-98 shadow-2xs"
              >
                <span className="text-[9px] font-bold block text-emerald-800">AC Electric Pass</span>
                <span className="text-xs font-black block text-emerald-950">₹50 <span className="text-[9px] font-normal text-emerald-700">/ Day</span></span>
              </button>
            </div>
          </div>

          {/* Women Free Pink Pass Generator Card */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-pink-500/15 border border-pink-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-700 dark:text-pink-300">
                Women Zero-Fare Scheme
              </span>
              <h4 className="text-xs font-black text-foreground">Pink Pass (Free for Women)</h4>
            </div>
            <Button
              onClick={handleIssueNewPinkTicket}
              size="sm"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl h-7 px-2.5 shadow-2xs"
            >
              Get Free Pass
            </Button>
          </div>

          {/* List of Active Passes */}
          <div className="space-y-2.5 pt-0.5">
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
                      className={`shadow-xs rounded-2xl overflow-hidden relative transition-all ${
                        isExpired
                          ? 'border-rose-500/40 bg-gradient-to-br from-card via-card to-rose-500/5'
                          : pass.passType.includes('Pink')
                          ? 'border-pink-500/40 bg-gradient-to-br from-pink-50/20 via-card to-rose-50/20'
                          : 'border-emerald-500/30 bg-gradient-to-br from-emerald-50/20 via-card to-teal-50/20'
                      }`}
                    >
                      {/* Pass Watermark Header */}
                      <div
                        className={`h-6 px-3 flex items-center justify-between text-[10px] font-black tracking-wider uppercase text-white ${
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
                        <span className="font-mono bg-black/25 px-1.5 py-0.2 rounded text-[9px]">
                          {currentTime}
                        </span>
                      </div>

                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-black text-foreground">{pass.passType}</h3>
                            <span className="text-[10px] text-muted-foreground block">
                              Holder: {pass.holderName} • Pass #{pass.passNumber}
                            </span>
                          </div>

                          <Badge
                            className={`font-black text-[9px] px-2 py-0.5 ${
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

                        {/* Verifiable QR Code Container with Expiry Stamp */}
                        <div className="p-2 rounded-xl bg-white text-slate-900 border border-border/80 flex flex-col items-center justify-center shadow-2xs relative overflow-hidden">
                          {isExpired && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-2">
                              <div className="rotate-[-18deg] px-3.5 py-1.5 rounded-lg border-2 border-rose-600 bg-white/95 text-center shadow-xl">
                                <span className="text-xs font-black text-rose-700 tracking-widest uppercase block">
                                  EXPIRED / INVALID
                                </span>
                                <span className="text-[8px] font-bold text-rose-600 block">
                                  PASS EXPIRED
                                </span>
                              </div>
                            </div>
                          )}

                          <svg
                            viewBox="0 0 160 160"
                            className={`size-32 drop-shadow-2xs transition-opacity duration-200 ${
                              isExpired ? 'opacity-20 grayscale blur-[0.5px]' : 'opacity-100'
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
                            <circle cx="80" cy="80" r="16" fill="#15803d" stroke="#fef08a" strokeWidth="2" />
                            <text x="80" y="83" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle">
                              DTC
                            </text>
                            <text x="80" y="90" fill="#fef08a" fontSize="5" fontWeight="700" textAnchor="middle">
                              PASS
                            </text>
                          </svg>

                          <div className="text-center mt-1">
                            <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider">
                              {pass.passNumber}
                            </span>
                            <p className="text-[8px] text-slate-500 font-medium">
                              Valid on all DTC & DIMTS Buses today
                            </p>
                          </div>
                        </div>

                        {/* Validity Footer */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                          <span className="text-muted-foreground text-[10px]">
                            Issued: <strong className="text-foreground">{pass.issuedDate || 'Today'}</strong>
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            Validity: <strong className="text-emerald-700 dark:text-emerald-400">Today till 23:59</strong>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* 2. Pass tickets from `passengerTickets` */}
                {activePassTickets.map((ticket) => renderTicketCard(ticket))}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY (PAST & EXPIRED TICKETS) */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {pastTickets.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground bg-card border border-border rounded-2xl p-4">
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
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            t.status === 'Expired' || isTicketExpired(t)
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                              : t.status === 'Scanned & Used'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {t.status === 'Expired' || isTicketExpired(t)
                            ? '❌ Expired'
                            : t.status === 'Scanned & Used'
                            ? '🟡 Used'
                            : t.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {t.sourceStop || t.boardingStop} ➔ {t.destinationStop}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        Booked: {formatTicketTime(t)} • Ticket: {t.ticketNumber}
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
                    <div className="p-2.5 pt-0 border-t border-border/60 bg-muted/10">
                      {renderTicketCard(t)}
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
            <div className="p-3 bg-emerald-700 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xs">
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
                  className="size-6 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-3.5 space-y-3 overflow-y-auto">
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
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground block">Select Pass Type:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPassTypeToBuy('Daily Non-AC');
                          setPassCost(40);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          passTypeToBuy === 'Daily Non-AC'
                            ? 'border-emerald-600 bg-emerald-500/10 font-black'
                            : 'border-border bg-card hover:bg-muted font-bold'
                        }`}
                      >
                        <span className="text-[9px] text-muted-foreground block">Non-AC Bus</span>
                        <span className="text-xs text-foreground">₹40 / Day</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPassTypeToBuy('Daily AC');
                          setPassCost(50);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          passTypeToBuy === 'Daily AC'
                            ? 'border-emerald-600 bg-emerald-500/10 font-black'
                            : 'border-border bg-card hover:bg-muted font-bold'
                        }`}
                      >
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 block">AC Electric + All</span>
                        <span className="text-xs text-foreground">₹50 / Day</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Holder:</span>
                      <span className="font-bold text-foreground">{passengerProfile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validity:</span>
                      <span className="font-bold text-foreground">Today till 23:59 (Midnight)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Routes:</span>
                      <span className="font-bold text-foreground">All Delhi NCR Routes</span>
                    </div>
                    <div className="pt-1 border-t border-border flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                        ₹{passCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Select UPI App */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground block">Pay With:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {UPI_APPS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setPassUpiApp(a.id)}
                          className={`p-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            passUpiApp === a.id
                              ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                              : 'border-border bg-card hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          <span className={`size-4 rounded ${a.iconBg} text-white flex items-center justify-center text-[9px] font-black`}>
                            {a.shortName.charAt(0)}
                          </span>
                          <span className="text-[11px]">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Authorize & Pay Button */}
                  <Button
                    onClick={handleExecutePassPurchase}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl h-9 shadow-sm flex items-center justify-center gap-2"
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
