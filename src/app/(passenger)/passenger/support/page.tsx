'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LifeBuoy,
  ShieldAlert,
  PhoneCall,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  Check,
  ChevronRight,
  Headphones,
} from 'lucide-react';

export default function PassengerSupportPage() {
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const refundRequests = useDtcStore((state) => state.refundRequests);
  const supportTickets = useDtcStore((state) => state.supportTickets);
  const submitPassengerRefund = useDtcStore((state) => state.submitPassengerRefund);
  const addSupportTicket = useDtcStore((state) => state.addSupportTicket);
  const passengerProfile = useDtcStore((state) => state.passengerProfile);

  // Active form view
  const [activeAction, setActiveAction] = useState<'none' | 'refund' | 'complaint'>('none');

  // Refund Form State
  const [selectedTicketNumber, setSelectedTicketNumber] = useState(
    passengerTickets[0]?.ticketNumber || ''
  );
  const [refundReason, setRefundReason] = useState<'Bus Breakdown' | 'Route Diverted' | 'Wrong Ticket Booked' | 'Double Debited'>('Bus Breakdown');
  const [upiId, setUpiId] = useState('priya@okhdfcbank');

  // Complaint Form State
  const [complaintCategory, setComplaintCategory] = useState<'Digital QR & Ticket Failure' | 'Bus Crew Misbehavior' | 'Route Delay & Missed Stop' | 'Lost & Found Property'>('Digital QR & Ticket Failure');
  const [complaintRoute, setComplaintRoute] = useState('502');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');

  // Emergency SOS Trigger
  const handleTriggerSOS = () => {
    toast.error('EMERGENCY SOS DISPATCHED: DTC Central Control Room & Delhi Police (112) alerted with your live bus coordinates!', {
      duration: 6000,
    });
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tkt = passengerTickets.find((t) => t.ticketNumber === selectedTicketNumber);
    const amount = tkt ? tkt.totalAmount : 25;

    submitPassengerRefund(selectedTicketNumber, amount, refundReason);
    toast.success(`Refund claim submitted for ${selectedTicketNumber} (₹${amount}). Processing via UPI within 2 hours.`);
    setActiveAction('none');
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject || !complaintDesc) {
      toast.error('Please enter a complaint subject and description.');
      return;
    }

    addSupportTicket({
      passengerName: passengerProfile.name,
      passengerPhone: passengerProfile.phone,
      passengerEmail: passengerProfile.email,
      category: complaintCategory,
      priority: 'High',
      status: 'Open',
      channel: 'Passenger Mobile App',
      routeNumber: complaintRoute,
      subject: complaintSubject,
      description: complaintDesc,
      assignedOfficer: 'Central Helpdesk Officer',
    });

    toast.success('Complaint registered! Ticket assigned to depot manager for investigation.');
    setComplaintSubject('');
    setComplaintDesc('');
    setActiveAction('none');
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">
          Help, Refunds & Emergency SOS
        </h2>
        <p className="text-[11px] text-muted-foreground">
          24x7 Commuter Assistance & Grievance Resolution
        </p>
      </div>

      {/* Emergency SOS Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20 text-white shrink-0 animate-ping">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Emergency Bus SOS
              </h3>
              <p className="text-[10px] text-white/90">
                Direct alert to Delhi Police (112) & Bus Marshals
              </p>
            </div>
          </div>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white text-rose-700 uppercase">
            24x7 Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            onClick={handleTriggerSOS}
            className="w-full bg-white hover:bg-slate-100 text-rose-700 font-black text-xs rounded-xl shadow-xs h-9"
          >
            Trigger SOS Alert
          </Button>
          <a href="tel:1800118181" className="w-full">
            <Button
              variant="outline"
              className="w-full border-white/40 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl h-9 gap-1.5"
            >
              <PhoneCall className="size-3.5" />
              <span>Call 1800-11-8181</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Service Action Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveAction(activeAction === 'refund' ? 'none' : 'refund')}
          className={`p-3 rounded-2xl border text-left transition-all space-y-1 shadow-2xs ${
            activeAction === 'refund'
              ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
              : 'border-border bg-card text-foreground hover:border-emerald-500/50'
          }`}
        >
          <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-1">
            <RotateCcw className="size-4" />
          </div>
          <span className="text-xs font-black block">Claim Refund</span>
          <span className="text-[10px] text-muted-foreground block">
            Breakdown or double debit
          </span>
        </button>

        <button
          onClick={() => setActiveAction(activeAction === 'complaint' ? 'none' : 'complaint')}
          className={`p-3 rounded-2xl border text-left transition-all space-y-1 shadow-2xs ${
            activeAction === 'complaint'
              ? 'border-purple-600 bg-purple-500/10 text-purple-800 dark:text-purple-300'
              : 'border-border bg-card text-foreground hover:border-purple-500/50'
          }`}
        >
          <div className="size-8 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-1">
            <MessageSquare className="size-4" />
          </div>
          <span className="text-xs font-black block">Lodge Complaint</span>
          <span className="text-[10px] text-muted-foreground block">
            Crew misconduct or missed stop
          </span>
        </button>
      </div>

      {/* Refund Form */}
      {activeAction === 'refund' && (
        <Card className="border-border rounded-2xl shadow-sm p-3.5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b pb-2 border-border">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RotateCcw className="size-3.5 text-emerald-600" />
              Automated UPI Refund Request
            </h4>
            <button onClick={() => setActiveAction('none')} className="text-muted-foreground">
              ✕
            </button>
          </div>

          <form onSubmit={handleRefundSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Select Journey Ticket</label>
              <select
                value={selectedTicketNumber}
                onChange={(e) => setSelectedTicketNumber(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
              >
                {passengerTickets.map((t) => (
                  <option key={t.id} value={t.ticketNumber}>
                    {t.ticketNumber} ({t.routeNumber} • ₹{t.totalAmount})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Reason for Refund</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs"
              >
                <option value="Bus Breakdown">Bus Breakdown Mid-Route</option>
                <option value="Route Diverted">Bus Diverted without Notice</option>
                <option value="Double Debited">Double Payment Debited</option>
                <option value="Wrong Ticket Booked">Wrong Destination Booked</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">UPI ID for Payout</label>
              <Input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@okaxis"
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9">
              Submit Refund Claim
            </Button>
          </form>
        </Card>
      )}

      {/* Complaint Form */}
      {activeAction === 'complaint' && (
        <Card className="border-border rounded-2xl shadow-sm p-3.5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b pb-2 border-border">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-purple-600" />
              Register Commuter Grievance
            </h4>
            <button onClick={() => setActiveAction('none')} className="text-muted-foreground">
              ✕
            </button>
          </div>

          <form onSubmit={handleComplaintSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Category</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value as any)}
                  className="w-full h-9 px-2 rounded-xl border border-input bg-background text-xs"
                >
                  <option value="Digital QR & Ticket Failure">QR / Ticket Issue</option>
                  <option value="Bus Crew Misbehavior">Crew Misconduct</option>
                  <option value="Route Delay & Missed Stop">Missed Stop</option>
                  <option value="Lost & Found Property">Lost Item</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Route #</label>
                <Input
                  value={complaintRoute}
                  onChange={(e) => setComplaintRoute(e.target.value)}
                  placeholder="e.g. 502"
                  className="text-xs h-9 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Incident Summary</label>
              <Input
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                placeholder="Brief summary..."
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Detailed Description</label>
              <textarea
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                rows={3}
                placeholder="Time, location of stop, what happened..."
                className="w-full p-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-hidden"
              />
            </div>

            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl h-9">
              Lodge Formal Complaint
            </Button>
          </form>
        </Card>
      )}

      {/* Commuter Claims & Tickets Status List */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          My Active Claims & Tickets
        </h3>

        <div className="space-y-2">
          {refundRequests.map((ref) => (
            <div key={ref.id} className="p-3 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground">Refund #{ref.ticketNumber}</span>
                  <Badge className={ref.status === 'Approved' ? 'bg-emerald-600' : 'bg-amber-600'}>
                    {ref.status}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Reason: {ref.reason} • Amount: ₹{ref.amount}
                </span>
                {ref.resolutionNotes && (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                    ✓ {ref.resolutionNotes}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">{ref.requestedAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
