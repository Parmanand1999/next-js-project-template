'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Ticket,
  Eye,
  ShieldCheck,
  User,
} from 'lucide-react';
import { PassengerTicket } from '@/types/dtc';
import { toast } from 'sonner';

export default function PassengerTicketsAndPassesPage() {
  const tickets = useDtcStore((state) => state.passengerTickets);
  const passes = useDtcStore((state) => state.passes);

  const [activeTab, setActiveTab] = useState<'tickets' | 'passes'>('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<PassengerTicket | null>(null);

  const filteredTickets = tickets.filter(
    (t) =>
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.passengerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.routeNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPasses = passes.filter(
    (p) =>
      p.passNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.holderPhone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 mb-2">
            <QrCode className="size-3.5" />
            Passenger Mobile App Central Ticketing Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            QR Tickets & DTC Bus Passes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time feed of digital QR single tickets, daily/monthly passes, and Pink Ticket (women free travel scheme).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeTab === 'tickets' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tickets')}
            className={`text-xs gap-1.5 ${activeTab === 'tickets' ? 'bg-emerald-700 text-white' : ''}`}
          >
            <Ticket className="size-3.5" />
            Live QR Tickets ({tickets.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'passes' ? 'default' : 'outline'}
            onClick={() => setActiveTab('passes')}
            className={`text-xs gap-1.5 ${activeTab === 'passes' ? 'bg-emerald-700 text-white' : ''}`}
          >
            <Sparkles className="size-3.5 text-pink-400" />
            DTC Passes & Pink Tickets ({passes.length})
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder={
            activeTab === 'tickets'
              ? 'Search by ticket ID, passenger mobile, route...'
              : 'Search by pass number, commuter name, mobile...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 text-sm"
        />
      </div>

      {/* Tickets Tab View */}
      {activeTab === 'tickets' && (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Passenger Mobile</th>
                  <th className="py-3 px-4">Route & Fleet</th>
                  <th className="py-3 px-4">Boarding ➔ Destination</th>
                  <th className="py-3 px-4">Fare Paid</th>
                  <th className="py-3 px-4">Booking Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">QR Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTickets.map((tk) => (
                  <tr key={tk.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {tk.ticketNumber}
                    </td>
                    <td className="py-3 px-4 text-foreground">+91 {tk.passengerPhone}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">Route {tk.routeNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{tk.busType}</div>
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {tk.sourceStop} &rarr; {tk.destinationStop}
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">₹{tk.totalAmount}</td>
                    <td className="py-3 px-4 text-muted-foreground">{tk.bookedAt}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          tk.status === 'Valid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                            : tk.status === 'Scanned & Used'
                            ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {tk.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTicket(tk)}
                        className="h-8 px-2.5 text-xs gap-1.5"
                      >
                        <Eye className="size-3.5" />
                        View QR
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Passes Tab View */}
      {activeTab === 'passes' && (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Pass Number</th>
                  <th className="py-3 px-4">Holder Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Pass Category</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPasses.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {p.passNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">{p.holderName}</td>
                    <td className="py-3 px-4 text-muted-foreground">+91 {p.holderPhone}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={`text-[10px] ${
                          p.passType.includes('Pink')
                            ? 'bg-pink-600 text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {p.passType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      {p.cost === 0 ? 'FREE' : `₹${p.cost}`}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">Valid until {p.validUntil}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Ticket Preview Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                DTC Mobile Passenger App
              </span>
              <h3 className="text-base font-black text-foreground">Single Journey Digital Ticket</h3>
              <p className="text-xs text-muted-foreground font-mono">{selectedTicket.ticketNumber}</p>
            </div>

            {/* Simulated QR Code box */}
            <div className="p-4 rounded-xl border-2 border-dashed border-emerald-600 bg-white flex flex-col items-center justify-center space-y-2">
              <div className="size-44 bg-slate-900 rounded-lg p-2.5 flex items-center justify-center">
                <QrCode className="size-full text-white" />
              </div>
              <span className="font-mono text-[10px] text-slate-700 font-bold">
                {selectedTicket.qrCodeData}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-left bg-muted/30 p-3 rounded-xl border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route:</span>
                <span className="font-bold text-foreground">Route {selectedTicket.routeNumber} ({selectedTicket.busType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stage:</span>
                <span className="text-foreground">{selectedTicket.sourceStop} &rarr; {selectedTicket.destinationStop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Fare:</span>
                <span className="font-bold text-emerald-600">₹{selectedTicket.totalAmount}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Till:</span>
                <span className="text-foreground">{selectedTicket.validUntil}</span>
              </div>
            </div>

            <Button
              className="w-full text-xs"
              variant="outline"
              onClick={() => setSelectedTicket(null)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
