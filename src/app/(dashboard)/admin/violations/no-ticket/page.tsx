'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Search,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Download,
  IndianRupee,
  FileCheck2,
  Printer,
} from 'lucide-react';
import { NoTicketChallan } from '@/types/dtc';
import { toast } from 'sonner';

export default function NoTicketViolationsPage() {
  const challans = useDtcStore((state) => state.noTicketChallans);
  const addNoTicketChallan = useDtcStore((state) => state.addNoTicketChallan);
  const updateChallanStatus = useDtcStore((state) => state.updateChallanStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedChallan, setSelectedChallan] = useState<NoTicketChallan | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // New challan form states
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pGender, setPGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [busNo, setBusNo] = useState('DL 1PD 8412');
  const [routeNo, setRouteNo] = useState('502');
  const [locationStop, setLocationStop] = useState('AIIMS Bus Terminal');
  const [conductorName, setConductorName] = useState('Rajesh Kumar (Cond.)');
  const [conductorBadge, setConductorBadge] = useState('DTC-C-4581');
  const [fareDue, setFareDue] = useState('25');
  const [payMode, setPayMode] = useState<'Cash' | 'Conductor UPI QR' | 'Pending'>('Cash');
  const [notes, setNotes] = useState('');

  const filteredChallans = challans.filter((ch) => {
    const matchesSearch =
      ch.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.conductorBadge.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && ch.status === statusFilter;
  });

  const totalCollected = challans
    .filter((c) => c.status === 'Paid on Spot')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const pendingAmount = challans
    .filter((c) => c.status === 'Pending Payment')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const handleIssueChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPhone) {
      toast.error('Passenger Name and Phone number are required.');
      return;
    }

    const due = parseFloat(fareDue) || 20;
    const penalty = 200; // Standard DTC Penalty

    addNoTicketChallan({
      passengerName: pName,
      passengerPhone: pPhone,
      gender: pGender,
      busNumber: busNo,
      routeNumber: routeNo,
      locationStop: locationStop,
      conductorName: conductorName,
      conductorBadge: conductorBadge,
      penaltyAmount: penalty,
      fareDue: due,
      totalAmount: penalty + due,
      paymentMode: payMode,
      status: payMode === 'Pending' ? 'Pending Payment' : 'Paid on Spot',
      notes: notes || 'Ticketless passenger apprehended during live inspection.',
    });

    toast.success('DTC No-Ticket Challan issued successfully.');
    setShowIssueModal(false);
    setPName('');
    setPPhone('');
    setNotes('');
  };

  const handleMarkAsPaid = (id: string) => {
    updateChallanStatus(id, 'Paid on Spot', 'Cash');
    toast.success('Challan status marked as Paid on Spot (Cash Collected).');
    if (selectedChallan && selectedChallan.id === id) {
      setSelectedChallan({
        ...selectedChallan,
        status: 'Paid on Spot',
        paymentMode: 'Cash',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 mb-2">
            <ShieldAlert className="size-3.5" />
            Delhi Motor Vehicles Act 1988 (Sec 178) Enforcement
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            No Ticket Challans
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time vigilance log of ticketless commuters apprehended by bus conductors and flying squads.
          </p>
        </div>

        <Button
          onClick={() => setShowIssueModal(true)}
          className="gap-2 bg-rose-700 hover:bg-rose-800 text-white shadow-sm shrink-0"
        >
          <Plus className="size-4" />
          Issue Spot Challan (₹200 Fine)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Challans Issued</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              {challans.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldAlert className="size-3.5 text-rose-600" />
            Across 5 Delhi transit corridors
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Spot Fine Collected</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-600">
              ₹{totalCollected.toLocaleString('en-IN')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Cash & Conductor UPI QR
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending Penalty Due</CardDescription>
            <CardTitle className="text-2xl font-black text-amber-600">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-amber-600" />
            Payable at Depot / Web Portal
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Mandatory Penalty Rate</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              ₹200 + Fare
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <FileCheck2 className="size-3.5 text-blue-600" />
            DTC Standard Statutory Tariff
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by Challan #, passenger, bus, conductor badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Status:</span>
          {['All', 'Paid on Spot', 'Pending Payment'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="text-xs h-8 px-3"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Challans Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Challan No.</th>
                <th className="py-3 px-4">Passenger Details</th>
                <th className="py-3 px-4">Bus & Route</th>
                <th className="py-3 px-4">Apprehended At</th>
                <th className="py-3 px-4">Conductor / Squad</th>
                <th className="py-3 px-4 text-right">Penalty + Fare</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No challans found matching your query.
                  </td>
                </tr>
              ) : (
                filteredChallans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {ch.challanNumber}
                      <div className="text-[10px] text-muted-foreground font-sans font-normal">
                        {ch.issuedAt}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{ch.passengerName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        +91 {ch.passengerPhone} ({ch.gender})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-bold">
                          Rt. {ch.routeNumber}
                        </span>
                        <span>{ch.busNumber}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {ch.locationStop}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-foreground font-medium">{ch.conductorName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {ch.conductorBadge}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-foreground">₹{ch.totalAmount}</div>
                      <div className="text-[10px] text-muted-foreground">
                        (₹200 fine + ₹{ch.fareDue} fare)
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          ch.status === 'Paid on Spot'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {ch.status} • {ch.paymentMode}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedChallan(ch)}
                        className="h-8 px-2.5 text-xs gap-1.5 text-foreground hover:bg-muted"
                      >
                        <Receipt className="size-3.5" />
                        Slip
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challan Receipt Modal */}
      {selectedChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            {/* Receipt Header */}
            <div className="border-b border-dashed border-border pb-4 text-center space-y-1">
              <div className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                Government of NCT of Delhi
              </div>
              <h3 className="text-lg font-black text-foreground">
                DELHI TRANSPORT CORPORATION
              </h3>
              <div className="text-xs text-rose-600 font-bold uppercase tracking-wider">
                Ticketless Travel Penalty Challan Slip
              </div>
              <div className="text-[10px] text-muted-foreground">
                Under Section 178 of Motor Vehicles Act, 1988
              </div>
            </div>

            {/* Receipt Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Challan Reference:</span>
                <span className="font-mono font-bold text-foreground">{selectedChallan.challanNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium text-foreground">{selectedChallan.issuedAt}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Passenger Name:</span>
                <span className="font-bold text-foreground">{selectedChallan.passengerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Phone Number:</span>
                <span className="text-foreground">+91 {selectedChallan.passengerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Bus & Route:</span>
                <span className="font-medium text-foreground">
                  {selectedChallan.busNumber} (Rt. {selectedChallan.routeNumber})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Apprehended At:</span>
                <span className="text-foreground">{selectedChallan.locationStop}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Issuing Officer / Conductor:</span>
                <span className="text-foreground">
                  {selectedChallan.conductorName} ({selectedChallan.conductorBadge})
                </span>
              </div>

              {/* Amount Breakdown */}
              <div className="bg-muted/40 p-3 rounded-xl space-y-1.5 mt-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Standard Statutory Penalty:</span>
                  <span>₹{selectedChallan.penaltyAmount}.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Actual Journey Fare Due:</span>
                  <span>₹{selectedChallan.fareDue}.00</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-foreground pt-1 border-t border-border">
                  <span>Total Amount Payable:</span>
                  <span className="text-rose-600">₹{selectedChallan.totalAmount}.00</span>
                </div>
              </div>

              <div className="flex justify-between py-1 items-center">
                <span className="text-muted-foreground">Settlement Status:</span>
                <Badge
                  className={
                    selectedChallan.status === 'Paid on Spot'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }
                >
                  {selectedChallan.status} ({selectedChallan.paymentMode})
                </Badge>
              </div>

              {selectedChallan.notes && (
                <div className="text-[11px] text-muted-foreground italic bg-background p-2 rounded border border-border">
                  Note: {selectedChallan.notes}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedChallan(null)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {selectedChallan.status === 'Pending Payment' && (
                  <Button
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                    onClick={() => handleMarkAsPaid(selectedChallan.id)}
                  >
                    Mark Paid on Spot
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1.5 text-xs"
                  onClick={() => toast.info('Challan Slip sent to printer/PDF download.')}
                >
                  <Printer className="size-3.5" />
                  Print Slip
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Spot Challan Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldAlert className="size-4 text-rose-600" />
                  Issue Spot Penalty Challan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Record ticketless passenger apprehended during live transit.
                </p>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueChallan} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Passenger Full Name</label>
                  <Input
                    placeholder="e.g. Ramesh Kumar"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Mobile Number</label>
                  <Input
                    placeholder="10-digit mobile"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Gender</label>
                  <select
                    value={pGender}
                    onChange={(e) => setPGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="mt-1 w-full h-9 text-xs px-2 rounded-lg border border-border bg-background"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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
                  <label className="font-semibold text-foreground">Apprehended Stop / Location</label>
                  <Input
                    value={locationStop}
                    onChange={(e) => setLocationStop(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Journey Fare Due (₹)</label>
                  <Input
                    type="number"
                    value={fareDue}
                    onChange={(e) => setFareDue(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Conductor / Squad Inspector</label>
                  <Input
                    value={conductorName}
                    onChange={(e) => setConductorName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Badge Number</label>
                  <Input
                    value={conductorBadge}
                    onChange={(e) => setConductorBadge(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as 'Cash' | 'Conductor UPI QR' | 'Pending')}
                  className="mt-1 w-full h-9 text-xs px-2 rounded-lg border border-border bg-background"
                >
                  <option value="Cash">Cash (Collected on Spot)</option>
                  <option value="Conductor UPI QR">Conductor UPI QR (Online on Spot)</option>
                  <option value="Pending">Pending (Challan slip given, payable at Depot)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground">Inspection Officer Remarks</label>
                <Input
                  placeholder="Reason / circumstance of evasion"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 flex justify-between items-center text-xs">
                <span className="font-semibold text-rose-800 dark:text-rose-300">
                  Total Penalty (Statutory ₹200 + ₹{fareDue} fare):
                </span>
                <span className="text-base font-black text-rose-700 dark:text-rose-400">
                  ₹{(200 + (parseFloat(fareDue) || 0)).toFixed(0)}
                </span>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIssueModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-rose-700 hover:bg-rose-800 text-white font-semibold"
                >
                  Confirm & Issue Challan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
