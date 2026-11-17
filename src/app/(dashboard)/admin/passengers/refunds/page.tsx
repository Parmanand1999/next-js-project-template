'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PassengerRefundsPage() {
  const refunds = useDtcStore((state) => state.refundRequests);
  const approveRefund = useDtcStore((state) => state.approveRefund);
  const rejectRefund = useDtcStore((state) => state.rejectRefund);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  const handleApprove = (id: string, name: string, amount: number) => {
    approveRefund(id, 'Auto-verified with GPS bus breakdown telemetry. Refund sent to UPI.');
    toast.success(`Refund of ₹${amount} approved for ${name}.`);
  };

  const handleReject = (id: string, name: string) => {
    rejectRefund(id, 'Trip was completed on alternate bus without disruption.');
    toast.error(`Refund request rejected for ${name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <RotateCcw className="size-3.5" />
            Passenger Automated UPI Claims & Cancellation Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Refunds & Grievances (रिफंड प्रबंधन)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and process ticket cancellation and breakdown refund claims initiated from the DTC Passenger App.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending Claims</CardDescription>
            <CardTitle className="text-2xl font-black text-amber-600">
              {refunds.filter((r) => r.status === 'Pending').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-amber-600" />
            Awaiting Depot / Admin verification
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Refunds Settled</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-600">
              {refunds.filter((r) => r.status === 'Approved').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Direct UPI reversal processed
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Average Turnaround</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              4.5 mins
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-blue-600" />
            AI Breakdown Cross-verification
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket #, passenger name, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Status:</span>
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
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

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket Number</th>
                <th className="py-3 px-4">Passenger</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reason for Claim</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4">Resolution Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRefunds.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {r.ticketNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{r.passengerName}</div>
                    <div className="text-[10px] text-muted-foreground">+91 {r.phone}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground">₹{r.amount}.00</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px]">
                      {r.reason}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{r.requestedAt}</td>
                  <td className="py-3 px-4 text-[11px] text-muted-foreground max-w-xs truncate">
                    {r.resolutionNotes || 'Awaiting review'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`text-[10px] ${
                        r.status === 'Approved'
                          ? 'bg-emerald-600 text-white'
                          : r.status === 'Pending'
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 text-[11px] px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white"
                          onClick={() => handleApprove(r.id, r.passengerName, r.amount)}
                        >
                          Approve UPI
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] px-2 border-rose-400 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleReject(r.id, r.passengerName)}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
