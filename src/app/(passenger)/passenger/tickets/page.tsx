'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { PassengerTicket } from '@/types/dtc';
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
  Download,
  Share2,
  X,
  ChevronRight,
  Check,
} from 'lucide-react';

export default function PassengerTicketsPage() {
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const passengerProfile = useDtcStore((state) => state.passengerProfile);
  const issuePinkPass = useDtcStore((state) => state.issuePinkPass);

  const [activeTab, setActiveTab] = useState<'active' | 'pink' | 'history'>('active');
  const [selectedTicket, setSelectedTicket] = useState<PassengerTicket | null>(null);

  // Live seconds watermark clock to prevent screenshot tampering
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeTickets = passengerTickets.filter((t) => t.status === 'Valid' && t.fare > 0);
  const pinkTickets = passengerTickets.filter((t) => t.fare === 0);
  const pastTickets = passengerTickets.filter((t) => t.status !== 'Valid');

  // Auto-select first active ticket if available
  useEffect(() => {
    if (activeTickets.length > 0 && !selectedTicket) {
      setSelectedTicket(activeTickets[0]);
    } else if (pinkTickets.length > 0 && !selectedTicket) {
      setSelectedTicket(pinkTickets[0]);
    }
  }, [activeTickets, pinkTickets, selectedTicket]);

  const handleIssueNewPinkTicket = () => {
    const ticket = issuePinkPass('All Delhi Routes');
    toast.success('Zero-Fare Pink Ticket generated for today!');
    setSelectedTicket(ticket);
    setActiveTab('pink');
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">
            My Tickets & Passes
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Digital QR tickets for conductor ETIM inspection
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
          onClick={() => setActiveTab('pink')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'pink'
              ? 'bg-card text-pink-700 dark:text-pink-300 shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Pink Pass (₹0)</span>
          <span className="text-[9px] px-1.5 rounded-full bg-pink-500/20 text-pink-700">
            {pinkTickets.length}
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
          <span>History</span>
        </button>
      </div>

      {/* ACTIVE TICKETS TAB */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activeTickets.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-card border border-border/70 rounded-2xl p-6">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <QrCode className="size-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">No Active Ticket</h4>
                <p className="text-[11px] text-muted-foreground">
                  You do not have any active journeys right now.
                </p>
              </div>
              <Link href="/passenger">
                <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl">
                  Book A Journey Now
                </Button>
              </Link>
            </div>
          ) : (
            activeTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-md rounded-2xl overflow-hidden relative"
              >
                {/* Live Anti-Screenshot Animated Watermark Header */}
                <div className="h-7 bg-emerald-700 text-white px-3 flex items-center justify-between text-[10px] font-black tracking-wider uppercase">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-white animate-pulse" />
                    LIVE VERIFIED TICKET
                  </span>
                  <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded">
                    {currentTime}
                  </span>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Journey Route & Bus Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        DTC Transit Pass
                      </span>
                      <h3 className="text-base font-black text-foreground">
                        Route {ticket.routeNumber} • {ticket.busType}
                      </h3>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5">
                      Valid for 2h
                    </Badge>
                  </div>

                  {/* High-Resolution Verifiable QR Code Container */}
                  <div className="p-4 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-emerald-600/40 flex flex-col items-center justify-center shadow-inner relative">
                    {/* SVG QR Code Simulation with Center DTC Logo */}
                    <svg viewBox="0 0 160 160" className="size-44 drop-shadow-xs">
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

                      {/* Random digital QR pattern cells */}
                      <rect x="60" y="15" width="8" height="8" fill="#047857" />
                      <rect x="75" y="15" width="12" height="8" fill="#064e3b" />
                      <rect x="92" y="20" width="8" height="8" fill="#047857" />
                      <rect x="60" y="32" width="14" height="6" fill="#064e3b" />
                      <rect x="80" y="30" width="18" height="8" fill="#047857" />
                      
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
                      <text x="80" y="84" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">
                        DTC
                      </text>

                      {/* Bottom data dots */}
                      <rect x="60" y="115" width="10" height="8" fill="#064e3b" />
                      <rect x="80" y="115" width="18" height="10" fill="#047857" />
                      <rect x="60" y="132" width="14" height="8" fill="#047857" />
                      <rect x="82" y="132" width="16" height="12" fill="#064e3b" />
                      <rect x="110" y="115" width="14" height="14" fill="#047857" />
                      <rect x="130" y="125" width="16" height="12" fill="#064e3b" />
                    </svg>

                    <div className="text-center mt-2">
                      <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider">
                        {ticket.ticketNumber}
                      </span>
                      <p className="text-[9px] text-slate-500 font-medium">
                        Present screen to Conductor ETIM Scanner
                      </p>
                    </div>
                  </div>

                  {/* Journey Details */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-bold text-foreground">{ticket.sourceStop || ticket.boardingStop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-bold text-foreground">{ticket.destinationStop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passenger:</span>
                      <span className="font-bold text-foreground">{ticket.passengersCount} Commuter</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border font-bold">
                      <span>Fare Paid:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">
                        ₹{ticket.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2">
                    <Link href="/passenger/support" className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold rounded-xl border-border h-8 gap-1"
                      >
                        <RotateCcw className="size-3 text-muted-foreground" />
                        <span>Need Refund?</span>
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      onClick={() => toast.success('Ticket details saved offline on your device!')}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-8 gap-1"
                    >
                      <Download className="size-3" />
                      <span>Save Offline</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* PINK PASS TAB */}
      {activeTab === 'pink' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/20">
                Delhi Govt Initiative
              </span>
              <h3 className="text-xs font-black">
                Free Bus Travel For Women
              </h3>
              <p className="text-[10px] opacity-90">
                Applicable on all Non-AC and standard DTC & DIMTS buses.
              </p>
            </div>
            <Button
              onClick={handleIssueNewPinkTicket}
              size="sm"
              className="bg-white hover:bg-slate-100 text-pink-700 font-bold text-xs rounded-xl shadow-xs shrink-0 h-8"
            >
              Get Free Pass
            </Button>
          </div>

          {pinkTickets.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground bg-card border border-border rounded-2xl p-4">
              No Pink Tickets issued today. Tap &quot;Get Free Pass&quot; above to issue your complimentary pass.
            </div>
          ) : (
            pinkTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="border-pink-500/30 bg-gradient-to-br from-pink-50/20 via-card to-rose-50/20 shadow-sm rounded-2xl overflow-hidden"
              >
                <div className="h-6 bg-pink-600 text-white px-3 flex items-center justify-between text-[10px] font-bold">
                  <span>ZERO FARE PINK TICKET</span>
                  <span>{ticket.validUntil}</span>
                </div>
                <CardContent className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground">Commuter Name</span>
                      <h4 className="text-xs font-bold text-foreground">{ticket.passengerName}</h4>
                    </div>
                    <Badge className="bg-pink-600 text-white font-bold text-[10px]">
                      ₹0 (Free)
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Valid on all operational Delhi routes for female commuters. Present ticket to conductor when requested.
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {pastTickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground bg-card border border-border rounded-2xl p-4">
              No past journeys recorded yet.
            </div>
          ) : (
            pastTickets.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">Route {t.routeNumber}</span>
                    <span className="text-[9px] px-1.5 rounded-full bg-muted text-muted-foreground">
                      {t.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {t.sourceStop || t.boardingStop} ➔ {t.destinationStop}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Booked: {t.bookedAt}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-foreground block">
                    {t.fare === 0 ? 'FREE' : `₹${t.totalAmount.toFixed(2)}`}
                  </span>
                  <Link href="/passenger/support" className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Refund / Help
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
