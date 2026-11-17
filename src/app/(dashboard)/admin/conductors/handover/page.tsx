'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftRight,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShiftHandoverPage() {
  const handovers = useDtcStore((state) => state.shiftHandovers);
  const recordHandover = useDtcStore((state) => state.recordShiftHandover);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [fromName, setFromName] = useState('Rajesh Kumar');
  const [fromBadge, setFromBadge] = useState('DTC-C-4581');
  const [toName, setToName] = useState('Anil Sharma');
  const [toBadge, setToBadge] = useState('DTC-C-5520');
  const [busNo, setBusNo] = useState('DL 1PD 8412');
  const [routeNo, setRouteNo] = useState('502');
  const [stop, setStop] = useState('Janpath Terminal');
  const [cash, setCash] = useState('1840');
  const [etimStatus, setEtimStatus] = useState<'Healthy' | 'Battery Low' | 'Paper Roll Replaced'>('Healthy');
  const [notes, setNotes] = useState('Shift 1 reconciliation completed without shortage.');

  const filtered = handovers.filter(
    (h) =>
      h.handoverCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.fromConductor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.toConductor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordHandover({
      fromConductor: fromName,
      fromBadge: fromBadge,
      toConductor: toName,
      toBadge: toBadge,
      busNumber: busNo,
      routeNumber: routeNo,
      handoverStop: stop,
      cashHandedOver: parseFloat(cash) || 0,
      etimStatus,
      status: 'Accepted',
      notes,
    });

    toast.success(`Duty Handover recorded from ${fromName} to ${toName}. Cash: ₹${cash}`);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <ArrowLeftRight className="size-3.5" />
            Mid-Route & Terminal Conductor Shift Handover
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Duty Handover Logs (ड्यूटी हैंडओवर)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verification of ticket machine status, cash reconciliation, and crew interchange protocols.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shrink-0"
        >
          <Plus className="size-4" />
          Record Duty Handover
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search handover code, conductor name, bus number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 text-sm"
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Handover Code</th>
                <th className="py-3 px-4">Outgoing Conductor</th>
                <th className="py-3 px-4">Incoming Conductor</th>
                <th className="py-3 px-4">Bus & Route</th>
                <th className="py-3 px-4">Handover Point</th>
                <th className="py-3 px-4">Cash Handed Over</th>
                <th className="py-3 px-4">ETIM Status</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {h.handoverCode}
                    <div className="text-[10px] text-muted-foreground font-sans font-normal">
                      {h.handoverTime}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{h.fromConductor}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{h.fromBadge}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{h.toConductor}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{h.toBadge}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">Route {h.routeNumber}</div>
                    <div className="text-[10px] text-muted-foreground">{h.busNumber}</div>
                  </td>

                  <td className="py-3 px-4 text-muted-foreground">{h.handoverStop}</td>

                  <td className="py-3 px-4 font-bold text-foreground">₹{h.cashHandedOver}.00</td>

                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px]">
                      {h.etimStatus}
                    </Badge>
                  </td>

                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      {h.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <h3 className="text-base font-bold text-foreground">Record Shift Handover</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">From Conductor</label>
                  <Input value={fromName} onChange={(e) => setFromName(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Badge No</label>
                  <Input value={fromBadge} onChange={(e) => setFromBadge(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">To Conductor</label>
                  <Input value={toName} onChange={(e) => setToName(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Badge No</label>
                  <Input value={toBadge} onChange={(e) => setToBadge(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Bus Number</label>
                  <Input value={busNo} onChange={(e) => setBusNo(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Route Number</label>
                  <Input value={routeNo} onChange={(e) => setRouteNo(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Handover Stop</label>
                  <Input value={stop} onChange={(e) => setStop(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Cash Handed Over (₹)</label>
                  <Input type="number" value={cash} onChange={(e) => setCash(e.target.value)} required />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                  Record Handover
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
