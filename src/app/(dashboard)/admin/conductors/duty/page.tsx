'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bus,
  IndianRupee,
  Layers,
  StopCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ConductorDutyPage() {
  const duties = useDtcStore((state) => state.conductorDuties);
  const startDuty = useDtcStore((state) => state.startConductorDuty);
  const endDuty = useDtcStore((state) => state.endConductorDuty);

  const [searchQuery, setSearchQuery] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);

  // Form states
  const [condName, setCondName] = useState('');
  const [badgeNo, setBadgeNo] = useState('DTC-C-');
  const [phone, setPhone] = useState('');
  const [depot, setDepot] = useState('Sarojini Nagar Depot');
  const [busNo, setBusNo] = useState('DL 1PD 8412');
  const [routeNo, setRouteNo] = useState('502');
  const [shift, setShift] = useState<'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 06:00)'>('Morning (06:00 - 14:00)');
  const [etimId, setEtimId] = useState('ETIM-SN-501');

  const filteredDuties = duties.filter(
    (d) =>
      d.conductorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.routeNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!condName || !phone) {
      toast.error('Conductor name and phone are required.');
      return;
    }

    startDuty({
      conductorName: condName,
      badgeNumber: badgeNo,
      phone,
      depot,
      busNumber: busNo,
      routeNumber: routeNo,
      shift,
      etimMachineId: etimId,
    });

    toast.success(`Duty punched in for Conductor ${condName} on Route ${routeNo}.`);
    setShowStartModal(false);
    setCondName('');
    setPhone('');
  };

  const handleEndDuty = (id: string, name: string, cash: number) => {
    endDuty(id, cash);
    toast.success(`Shift completed for ${name}. Total cash tallied: ₹${cash}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <UserCheck className="size-3.5" />
            Conductor Mobile App Roster & Duty Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Conductor Duty & Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time tracking of conductor duty punch-in, ETIM issuance, ticket collection, and end-of-shift cash tally.
          </p>
        </div>

        <Button
          onClick={() => setShowStartModal(true)}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shrink-0"
        >
          <Plus className="size-4" />
          Punch In Conductor Duty
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Conductors On Duty</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-600">
              {duties.filter((d) => d.status === 'On Duty').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Active on route corridors
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Shifts Completed Today</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              {duties.filter((d) => d.status === 'Shift Completed' || d.status === 'Handed Over').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Depot cash checked in
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pink Tickets Dispensed</CardDescription>
            <CardTitle className="text-2xl font-black text-pink-600">
              {duties.reduce((sum, d) => sum + d.pinkTicketsIssued, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Female passenger free rides
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Cash Reconciled</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              ₹{duties.reduce((sum, d) => sum + d.totalCashCollected, 0).toLocaleString('en-IN')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Depot cash box deposit
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by conductor name, badge #, bus #, route..."
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
                <th className="py-3 px-4">Conductor Details</th>
                <th className="py-3 px-4">Bus & Route</th>
                <th className="py-3 px-4">Depot & Shift</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">ETIM Machine</th>
                <th className="py-3 px-4">Tickets (Digital / Cash)</th>
                <th className="py-3 px-4">Pink Passes</th>
                <th className="py-3 px-4">Cash Tally</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDuties.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-foreground">{d.conductorName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {d.badgeNumber} &bull; +91 {d.phone}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">Route {d.routeNumber}</div>
                    <div className="text-[10px] text-muted-foreground">{d.busNumber}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-foreground">{d.depot}</div>
                    <div className="text-[10px] text-muted-foreground">{d.shift}</div>
                  </td>

                  <td className="py-3 px-4 text-muted-foreground">{d.dutyStartTime}</td>

                  <td className="py-3 px-4 font-mono font-medium text-foreground">
                    {d.etimMachineId}
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-blue-600 font-semibold">{d.ticketsSoldDigital} App</span>
                    {' / '}
                    <span className="text-foreground font-semibold">{d.ticketsSoldCash} Cash</span>
                  </td>

                  <td className="py-3 px-4 font-bold text-pink-600">
                    {d.pinkTicketsIssued}
                  </td>

                  <td className="py-3 px-4 font-bold text-foreground">
                    ₹{d.totalCashCollected}
                  </td>

                  <td className="py-3 px-4">
                    <Badge
                      className={`text-[10px] ${
                        d.status === 'On Duty'
                          ? 'bg-emerald-600 text-white'
                          : d.status === 'Handed Over'
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {d.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {d.status === 'On Duty' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] px-2 text-rose-600 border-rose-300 hover:bg-rose-50"
                        onClick={() => handleEndDuty(d.id, d.conductorName, d.totalCashCollected || 1800)}
                      >
                        <StopCircle className="size-3 mr-1" />
                        End Duty
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Ended</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Duty Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <h3 className="text-base font-bold text-foreground">Punch In Conductor Shift</h3>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartDuty} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Conductor Name</label>
                <Input
                  value={condName}
                  onChange={(e) => setCondName(e.target.value)}
                  placeholder="e.g. Anand Prakash"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Badge Number</label>
                  <Input
                    value={badgeNo}
                    onChange={(e) => setBadgeNo(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Mobile Phone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Assigned Depot</label>
                  <Input
                    value={depot}
                    onChange={(e) => setDepot(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">ETIM Machine ID</label>
                  <Input
                    value={etimId}
                    onChange={(e) => setEtimId(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
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

              <div>
                <label className="font-semibold text-foreground">Shift Timings</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="mt-1 w-full h-9 text-xs px-2 rounded-lg border border-border bg-background"
                >
                  <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                  <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                  <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStartModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Start Duty
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
