'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { InvalidTicketReason, InvalidTicketViolation } from '@/types/dtc';
import { toast } from 'sonner';

export default function InvalidTicketViolationsPage() {
  const violations = useDtcStore((state) => state.invalidTicketViolations);
  const addViolation = useDtcStore((state) => state.addInvalidTicketViolation);
  const updateAction = useDtcStore((state) => state.updateInvalidTicketAction);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState('All');
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Simulation form states
  const [ticketId, setTicketId] = useState('QR-DTC-99120');
  const [pName, setPName] = useState('Manish Tiwari');
  const [reason, setReason] = useState<InvalidTicketReason>('QR Code Expired');
  const [busNo, setBusNo] = useState('DL 1PD 8412');
  const [routeNo, setRouteNo] = useState('502');
  const [stop, setStop] = useState('AIIMS / Safdarjung');
  const [conductor, setConductor] = useState('Rajesh Kumar (Cond.)');
  const [badge, setBadge] = useState('DTC-C-4581');
  const [fareDiff, setFareDiff] = useState('10');
  const [penalty, setPenalty] = useState('200');
  const [action, setAction] = useState<InvalidTicketViolation['actionTaken']>('Difference Fare Collected');

  const filteredViolations = violations.filter((v) => {
    const matchesSearch =
      v.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedReason === 'All') return matchesSearch;
    return matchesSearch && v.reason === selectedReason;
  });

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    addViolation({
      ticketId,
      passengerName: pName,
      reason,
      busNumber: busNo,
      routeNumber: routeNo,
      detectedAtStop: stop,
      conductorName: conductor,
      conductorBadge: badge,
      fareDifference: parseFloat(fareDiff) || 0,
      penaltyAmount: parseFloat(penalty) || 0,
      actionTaken: action,
      status: 'Resolved',
    });

    toast.success(`Simulated scan: Ticket ${ticketId} flagged for ${reason}`);
    setShowSimulateModal(false);
  };

  const handleQuickResolve = (id: string, newAction: InvalidTicketViolation['actionTaken']) => {
    updateAction(id, newAction, 'Resolved');
    toast.success(`Action updated to: ${newAction}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
            <AlertTriangle className="size-3.5" />
            Conductor ETIM & QR Scan Verification Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Invalid Ticket Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time feed of rejected scans, expired digital QR tickets, screenshot duplication, and fare stage violations.
          </p>
        </div>

        <Button
          onClick={() => setShowSimulateModal(true)}
          className="gap-2 bg-amber-700 hover:bg-amber-800 text-white shadow-sm shrink-0"
        >
          <Plus className="size-4" />
          Simulate ETIM Scan Rejection
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Scan Rejections</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              {violations.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <QrCode className="size-3.5 text-amber-600" />
            Intercepted across all routes today
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Expired QR Detections</CardDescription>
            <CardTitle className="text-2xl font-black text-rose-600">
              {violations.filter((v) => v.reason === 'QR Code Expired').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-rose-600" />
            Validity window (&gt;90m) passed
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Screenshot / Duplication</CardDescription>
            <CardTitle className="text-2xl font-black text-purple-600">
              {violations.filter((v) => v.reason === 'Duplicate / Screenshot Misuse').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Copy className="size-3.5 text-purple-600" />
            Duplicate QR signature detected
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Fare Difference Collected</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-600">
              ₹{violations.reduce((sum, v) => sum + v.fareDifference, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Difference fare recovered on-bus
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search ticket ID, passenger, bus, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-muted-foreground shrink-0">Violation Reason:</span>
          {[
            'All',
            'QR Code Expired',
            'Wrong Bus Route',
            'Non-AC Ticket in AC Bus',
            'Duplicate / Screenshot Misuse',
          ].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={selectedReason === r ? 'default' : 'outline'}
              onClick={() => setSelectedReason(r)}
              className="text-xs h-8 px-3 shrink-0"
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Passenger</th>
                <th className="py-3 px-4">Bus & Route</th>
                <th className="py-3 px-4">Violation Detected</th>
                <th className="py-3 px-4">Conductor Details</th>
                <th className="py-3 px-4">Recovery (Fare/Fine)</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No violation records matching filter.
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {v.ticketId}
                      <div className="text-[10px] text-muted-foreground font-sans font-normal">
                        {v.timestamp}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-foreground">
                      {v.passengerName}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-bold">
                          Rt. {v.routeNumber}
                        </span>
                        <span>{v.busNumber}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{v.detectedAtStop}</div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          v.reason === 'QR Code Expired'
                            ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400'
                            : v.reason === 'Duplicate / Screenshot Misuse'
                            ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {v.reason}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-foreground font-medium">{v.conductorName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {v.conductorBadge}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {v.fareDifference > 0 && (
                        <div className="text-emerald-600 font-bold">
                          +₹{v.fareDifference} Diff Fare
                        </div>
                      )}
                      {v.penaltyAmount > 0 && (
                        <div className="text-rose-600 font-bold">
                          +₹{v.penaltyAmount} Penalty
                        </div>
                      )}
                      {v.fareDifference === 0 && v.penaltyAmount === 0 && (
                        <div className="text-muted-foreground">None</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold bg-muted text-foreground"
                      >
                        {v.actionTaken}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {v.actionTaken !== 'Penalty Levied' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickResolve(v.id, 'Penalty Levied')}
                          className="text-[10px] h-7 px-2 border-rose-400 text-rose-600 hover:bg-rose-50"
                        >
                          Levy ₹200 Fine
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="size-3" /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-600" />
                  Simulate Conductor ETIM Scan Rejection
                </h3>
                <p className="text-xs text-muted-foreground">
                  Test live invalid ticket detection behaviour.
                </p>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateScan} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Scanned QR Ticket ID</label>
                <Input
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Passenger Name</label>
                <Input
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Violation Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as InvalidTicketReason)}
                  className="mt-1 w-full h-9 text-xs px-2 rounded-lg border border-border bg-background"
                >
                  <option value="QR Code Expired">QR Code Expired</option>
                  <option value="Wrong Bus Route">Wrong Bus Route</option>
                  <option value="Non-AC Ticket in AC Bus">Non-AC Ticket in AC Bus</option>
                  <option value="Duplicate / Screenshot Misuse">Duplicate / Screenshot Misuse</option>
                  <option value="Over-travel (Beyond Destination)">Over-travel (Beyond Destination)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Bus Number</label>
                  <Input
                    value={busNo}
                    onChange={(e) => setBusNo(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Route Number</label>
                  <Input
                    value={routeNo}
                    onChange={(e) => setRouteNo(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Difference Fare Due (₹)</label>
                  <Input
                    type="number"
                    value={fareDiff}
                    onChange={(e) => setFareDiff(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Penalty Levied (₹)</label>
                  <Input
                    type="number"
                    value={penalty}
                    onChange={(e) => setPenalty(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Action Taken by Conductor</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as InvalidTicketViolation['actionTaken'])}
                  className="mt-1 w-full h-9 text-xs px-2 rounded-lg border border-border bg-background"
                >
                  <option value="Difference Fare Collected">Difference Fare Collected</option>
                  <option value="Penalty Levied">Penalty Levied (₹200 fine)</option>
                  <option value="Warned & Deboarded">Warned & Deboarded</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSimulateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-700 hover:bg-amber-800 text-white font-semibold"
                >
                  Log Scanned Violation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
