'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  QrCode,
  ShieldAlert,
  MapPin,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  X,
  Calendar,
  Smartphone,
  Play,
  Square,
  AlertTriangle,
  Building2,
  Coffee,
  FileText,
  XCircle,
  TrendingUp,
  LogOut,
  ChevronRight,
  Check,
} from 'lucide-react';

export default function ConductorDashboardPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const conductorAttendances = useDtcStore((state) => state.conductorAttendances);
  const punchInAttendance = useDtcStore((state) => state.punchInAttendance);
  const endConductorDuty = useDtcStore((state) => state.endConductorDuty);
  const routes = useDtcStore((state) => state.routes);
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const noTicketChallans = useDtcStore((state) => state.noTicketChallans);
  const currentStopIndex = useDtcStore((state) => state.currentStopIndex);
  const advanceBusStop = useDtcStore((state) => state.advanceBusStop);
  const reverseBusStop = useDtcStore((state) => state.reverseBusStop);

  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];
  const assignedRoute = routes.find((r) => r.routeNumber === activeDuty.routeNumber) || routes[0];

  const currentStop = assignedRoute.stops[currentStopIndex] || assignedRoute.stops[0];
  const nextStop = assignedRoute.stops[currentStopIndex + 1];
  const prevStop = currentStopIndex > 0 ? assignedRoute.stops[currentStopIndex - 1] : null;

  const totalPassengers = activeDuty.ticketsSoldDigital + activeDuty.pinkTicketsIssued;

  // Active View Tab: 'duty' (Live Operations) vs 'attendance' (Monthly Duty Register)
  const [activeView, setActiveView] = useState<'duty' | 'attendance'>('duty');

  // Duty Start / End State
  const [isPunchInSubmitting, setIsPunchInSubmitting] = useState<boolean>(false);
  const [isEndDutyModalOpen, setIsEndDutyModalOpen] = useState<boolean>(false);
  const [isEndingDuty, setIsEndingDuty] = useState<boolean>(false);

  // Attendance Register Filter
  const [attendanceFilter, setAttendanceFilter] = useState<'All' | 'Present' | 'Absent' | 'OffLeave'>('All');

  // Today's active attendance
  const todayAttendance = conductorAttendances.find(
    (a) => a.badgeNumber === activeDuty.badgeNumber && a.date.includes('19 Nov')
  );
  const isOnDuty = activeDuty.status === 'On Duty' && todayAttendance?.status === 'Present';
  const isShiftCompleted = activeDuty.status === 'Shift Completed';

  // 1. Handle Conductor Start Duty
  const handleStartDuty = () => {
    setIsPunchInSubmitting(true);
    setTimeout(() => {
      punchInAttendance({
        dutyId: activeDuty.id,
        location: `${activeDuty.depot} (Conductor Mobile App)`,
        shift: activeDuty.shift,
      });
      setIsPunchInSubmitting(false);
      toast.success(
        `Duty Started! Punch-in recorded for ${activeDuty.conductorName} (${activeDuty.badgeNumber}). Attendance marked as PRESENT.`
      );
    }, 450);
  };

  // 2. Handle Conductor End Duty
  const handleConfirmEndDuty = () => {
    setIsEndingDuty(true);
    setTimeout(() => {
      endConductorDuty(activeDuty.id, activeDuty.totalCashCollected);
      setIsEndingDuty(false);
      setIsEndDutyModalOpen(false);
      toast.success(
        `Shift Completed! Punch-out recorded for ${activeDuty.conductorName}. Cash collected: ₹${activeDuty.totalCashCollected}.`
      );
    }, 450);
  };

  // Attendance calculations for Rajesh Kumar
  const myAttendances = conductorAttendances.filter(
    (a) => a.badgeNumber === activeDuty.badgeNumber
  );

  const presentCount = myAttendances.filter(
    (a) => a.status === 'Present' || a.status === 'Shift Completed' || a.status === 'Handed Over'
  ).length;

  const absentCount = myAttendances.filter((a) => a.status === 'Absent').length;
  const offCount = myAttendances.filter((a) => a.status === 'Weekly Off').length;
  const leaveCount = myAttendances.filter((a) => a.status === 'Leave').length;

  // Filtered attendances
  const filteredAttendances = myAttendances.filter((a) => {
    if (attendanceFilter === 'Present') {
      return a.status === 'Present' || a.status === 'Shift Completed' || a.status === 'Handed Over';
    }
    if (attendanceFilter === 'Absent') return a.status === 'Absent';
    if (attendanceFilter === 'OffLeave') return a.status === 'Weekly Off' || a.status === 'Leave';
    return true;
  });

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* TOP VIEW TOGGLE: LIVE DUTY vs ATTENDANCE REGISTER */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border">
        <button
          type="button"
          onClick={() => setActiveView('duty')}
          className={`h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeView === 'duty'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <Smartphone className="size-3.5" />
          <span>Live Shift Duty</span>
          {isOnDuty && <span className="size-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveView('attendance')}
          className={`h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeView === 'attendance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <CalendarCheck className="size-3.5" />
          <span>Attendance Register</span>
          <Badge className="bg-white/20 text-white hover:bg-white/30 text-[9px] py-0 px-1 font-mono">
            {myAttendances.length}
          </Badge>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: LIVE SHIFT DUTY (START DUTY / END DUTY / STAGE / METRICS) */}
      {/* ============================================================== */}
      {activeView === 'duty' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* A. DUTY CONTROLLER CARD */}
          {!isOnDuty ? (
            /* State 1: Duty Pending / Not Started */
            <Card className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-2xl p-4 shadow-md space-y-3 border-none">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                    <Smartphone className="size-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white/80 block">
                      Shift Duty Check-In
                    </span>
                    <h2 className="text-base font-black tracking-tight">
                      {isShiftCompleted ? "Start Today's Overtime / Next Shift" : "Start Today's Duty"}
                    </h2>
                  </div>
                </div>
                <Badge className="bg-amber-400 text-amber-950 font-black text-[9px] uppercase tracking-wider">
                  {isShiftCompleted ? 'Completed (Tap to Restart)' : 'Check-In Pending'}
                </Badge>
              </div>

              {/* Duty Details */}
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Conductor:</span>
                  <span className="font-bold">{activeDuty.conductorName} ({activeDuty.badgeNumber})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Assigned Route:</span>
                  <span className="font-bold font-mono">Route {activeDuty.routeNumber} ({assignedRoute.origin} ➔ {assignedRoute.destination})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Bus Number:</span>
                  <span className="font-bold font-mono">{activeDuty.busNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Depot & Shift:</span>
                  <span>{activeDuty.depot} • {activeDuty.shift.split(' ')[0]}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10 text-white/80">
                  <span>Verification:</span>
                  <span className="text-emerald-200 font-semibold">✓ Conductor Mobile Session Active</span>
                </div>
              </div>

              <Button
                type="button"
                disabled={isPunchInSubmitting}
                onClick={handleStartDuty}
                className="w-full h-11 rounded-xl bg-white hover:bg-white/90 text-emerald-800 font-black text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Play className="size-4 fill-emerald-800" />
                <span>{isPunchInSubmitting ? 'Recording Punch-In...' : 'Start Shift Duty (Phone Login)'}</span>
              </Button>
            </Card>
          ) : (
            /* State 2: Duty Is ACTIVE (ON DUTY) */
            <Card className="bg-card border-2 border-emerald-500/40 shadow-xs rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CalendarCheck className="size-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-foreground">
                        Shift Duty: ON DUTY
                      </span>
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <Badge className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20 text-[9px] font-bold py-0">
                        Present
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">
                      Punched In: <strong>{todayAttendance?.punchInTime || activeDuty.dutyStartTime}</strong> • {activeDuty.depot}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveView('attendance')}
                  className="h-8 px-2 rounded-xl border-border bg-muted/40 hover:bg-muted text-foreground font-bold text-[10px] flex items-center gap-1"
                >
                  <Calendar className="size-3 text-emerald-600" />
                  <span>Register ({myAttendances.length})</span>
                </Button>
              </div>

              {/* End Duty Action Bar */}
              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900 flex items-center justify-between gap-2">
                <div className="text-[11px] text-rose-900 dark:text-rose-200">
                  <span className="font-bold block">Ready to finish your shift?</span>
                  <span className="text-[10px] text-muted-foreground">Punch-out time & date will be logged.</span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsEndDutyModalOpen(true)}
                  className="h-8 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <LogOut className="size-3.5" />
                  <span>End Duty</span>
                </Button>
              </div>
            </Card>
          )}

          {/* B. CURRENT BUS STOP STAGE & HALTING STEPPER */}
          <Card className="bg-card border-border/80 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Live Stage {currentStop.stage} of {assignedRoute.stops[assignedRoute.stops.length - 1]?.stage || 7}
                </span>
              </div>
              <Badge className="bg-background text-foreground border-border text-[10px] font-mono">
                Stop {currentStopIndex + 1}/{assignedRoute.stops.length}
              </Badge>
            </div>

            <CardContent className="p-3.5 space-y-3">
              {/* Current Stop Display */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                  Current Bus Shelter / Halting Stop
                </span>
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-emerald-600 shrink-0" />
                  <h2 className="text-base font-black text-foreground tracking-tight">
                    {currentStop.name}
                  </h2>
                </div>
                {nextStop && (
                  <span className="text-[11px] text-muted-foreground block pl-7">
                    ➔ Next Stop:{' '}
                    <strong className="text-foreground font-bold">{nextStop.name}</strong> (~
                    {Math.abs(Math.round((nextStop.distanceKm - currentStop.distanceKm) * 10) / 10)} km)
                  </span>
                )}
              </div>

              {/* Stepper Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentStopIndex <= 0}
                  onClick={() => {
                    reverseBusStop();
                    toast.info(`Bus position set back to: ${prevStop?.name}`);
                  }}
                  className="h-8 px-2.5 rounded-xl border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-bold disabled:opacity-30"
                >
                  <ArrowLeft className="size-3.5 mr-1" />
                  <span>Prev</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={!nextStop}
                  onClick={() => {
                    advanceBusStop();
                    toast.success(`Bus arrived at: ${nextStop?.name}`);
                  }}
                  className="flex-1 h-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <span>Arrived at Next Stop</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* C. SHIFT PASSENGER & DUTY METRICS */}
          <div className="grid grid-cols-2 gap-2">
            {/* Digital QR Scans */}
            <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] uppercase font-bold tracking-wider">Digital QR Validated</span>
                <QrCode className="size-3.5 text-emerald-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-foreground font-mono">{activeDuty.ticketsSoldDigital}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">App Tickets</span>
              </div>
            </div>

            {/* Pink Passes Validated */}
            <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] uppercase font-bold tracking-wider">Free Pink Passes</span>
                <Sparkles className="size-3.5 text-pink-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-foreground font-mono">{activeDuty.pinkTicketsIssued}</span>
                <span className="text-[10px] text-pink-700 dark:text-pink-400 font-bold">₹0 Passes</span>
              </div>
            </div>

            {/* Section 178 Challans Issued */}
            <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] uppercase font-bold tracking-wider">Challans Issued</span>
                <ShieldAlert className="size-3.5 text-amber-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-foreground font-mono">{noTicketChallans.length}</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Violations</span>
              </div>
            </div>

            {/* Total Commuters On Shift */}
            <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total Commuters</span>
                <Users className="size-3.5 text-blue-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-foreground font-mono">{totalPassengers}</span>
                <span className="text-[10px] text-muted-foreground font-bold">Validated</span>
              </div>
            </div>
          </div>

          {/* D. RECENT ACTIVITY LOGS */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-600" />
                Recent Ticket Validations
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Live Stream</span>
            </div>

            <div className="space-y-1.5">
              {passengerTickets.slice(0, 4).map((ticket) => {
                const isPink = ticket.fare === 0;

                return (
                  <div
                    key={ticket.id}
                    className="p-2.5 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
                        <span className="truncate">{ticket.sourceStop || ticket.boardingStop}</span>
                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{ticket.destinationStop}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-mono text-foreground font-medium">#{ticket.ticketNumber.slice(-8)}</span>
                        <span>•</span>
                        <span>{ticket.passengersCount} Commuter{ticket.passengersCount > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span className="text-muted-foreground/80">{ticket.bookedAt}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge
                        className={`text-[9px] font-bold ${
                          isPink
                            ? 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20'
                            : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                        }`}
                      >
                        {isPink ? 'FREE PINK' : `₹${ticket.totalAmount}`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: MONTHLY ATTENDANCE REGISTER (PRESENT / ABSENT TRACKER) */}
      {/* ============================================================== */}
      {activeView === 'attendance' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-foreground flex items-center gap-1.5">
                <CalendarCheck className="size-4.5 text-emerald-600" />
                <span>Duty & Attendance Register</span>
              </h2>
              <span className="text-[10px] text-muted-foreground font-mono">
                November 2026 • {activeDuty.conductorName} ({activeDuty.badgeNumber})
              </span>
            </div>

            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-bold">
              {Math.round((presentCount / (presentCount + absentCount || 1)) * 100)}% Present
            </Badge>
          </div>

          {/* Monthly KPI Overview Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Present (Duty) */}
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-300 mb-0.5">
                <CheckCircle2 className="size-3" />
                <span className="text-[9px] uppercase font-bold">Duty</span>
              </div>
              <span className="text-lg font-black text-emerald-800 dark:text-emerald-200 font-mono">
                {presentCount}
              </span>
              <span className="text-[9px] text-emerald-600 block">Days</span>
            </div>

            {/* Absent */}
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-center justify-center gap-1 text-rose-700 dark:text-rose-300 mb-0.5">
                <XCircle className="size-3" />
                <span className="text-[9px] uppercase font-bold">Absent</span>
              </div>
              <span className="text-lg font-black text-rose-800 dark:text-rose-200 font-mono">
                {absentCount}
              </span>
              <span className="text-[9px] text-rose-600 block">Days</span>
            </div>

            {/* Weekly Off */}
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-center gap-1 text-purple-700 dark:text-purple-300 mb-0.5">
                <Coffee className="size-3" />
                <span className="text-[9px] uppercase font-bold">Off</span>
              </div>
              <span className="text-lg font-black text-purple-800 dark:text-purple-200 font-mono">
                {offCount}
              </span>
              <span className="text-[9px] text-purple-600 block">Rest</span>
            </div>

            {/* Leave */}
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-300 mb-0.5">
                <FileText className="size-3" />
                <span className="text-[9px] uppercase font-bold">Leave</span>
              </div>
              <span className="text-lg font-black text-amber-800 dark:text-amber-200 font-mono">
                {leaveCount}
              </span>
              <span className="text-[9px] text-amber-600 block">Casual</span>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            <button
              type="button"
              onClick={() => setAttendanceFilter('All')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                attendanceFilter === 'All'
                  ? 'bg-foreground text-background border-foreground shadow-2xs'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              All Days ({myAttendances.length})
            </button>

            <button
              type="button"
              onClick={() => setAttendanceFilter('Present')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                attendanceFilter === 'Present'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              Duty Done ({presentCount})
            </button>

            <button
              type="button"
              onClick={() => setAttendanceFilter('Absent')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                attendanceFilter === 'Absent'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              Absent Days ({absentCount})
            </button>

            <button
              type="button"
              onClick={() => setAttendanceFilter('OffLeave')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                attendanceFilter === 'OffLeave'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              Off & Leaves ({offCount + leaveCount})
            </button>
          </div>

          {/* Day-by-Day Roster Records */}
          <div className="space-y-2">
            {filteredAttendances.map((att) => {
              const isPresent = att.status === 'Present' || att.status === 'Shift Completed' || att.status === 'Handed Over';
              const isAbsent = att.status === 'Absent';
              const isWeeklyOff = att.status === 'Weekly Off';
              const isLeave = att.status === 'Leave';

              return (
                <div
                  key={att.id}
                  className={`p-3 rounded-2xl border text-xs space-y-2 transition-all shadow-2xs ${
                    isPresent
                      ? 'bg-card border-border hover:border-emerald-500/40'
                      : isAbsent
                      ? 'bg-rose-500/5 border-rose-500/30'
                      : isWeeklyOff
                      ? 'bg-purple-500/5 border-purple-500/30'
                      : 'bg-amber-500/5 border-amber-500/30'
                  }`}
                >
                  {/* Top Line: Date & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-foreground">
                      <Calendar className={`size-3.5 ${
                        isPresent ? 'text-emerald-600' : isAbsent ? 'text-rose-600' : isWeeklyOff ? 'text-purple-600' : 'text-amber-600'
                      }`} />
                      <span>{att.date}</span>
                      {att.date.includes('19 Nov') && (
                        <Badge className="bg-emerald-600 text-white text-[8px] py-0 px-1 font-bold">
                          Today
                        </Badge>
                      )}
                    </div>

                    <Badge
                      className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 ${
                        isPresent
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                          : isAbsent
                          ? 'bg-rose-600 text-white border-rose-600'
                          : isWeeklyOff
                          ? 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/30'
                          : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isAbsent ? '✕ ABSENT' : isWeeklyOff ? 'WEEKLY OFF' : isLeave ? 'LEAVE' : att.status === 'Present' ? '● ON DUTY' : 'DUTY COMPLETED'}
                    </Badge>
                  </div>

                  {/* Body Content based on Status */}
                  {isPresent ? (
                    /* Duty Done Details */
                    <div className="space-y-1.5 pt-0.5">
                      <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-muted/40 font-mono text-[11px]">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                            Punch In:
                          </span>
                          <strong className="text-foreground">{att.punchInTime}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                            Punch Out:
                          </span>
                          <strong className="text-foreground">
                            {att.punchOutTime || (att.status === 'Present' ? 'Active Duty' : '--')}
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                          Route {att.routeNumber} ({att.busNumber})
                        </span>
                        {att.hoursWorked && (
                          <span className="font-mono text-foreground font-semibold">
                            ⏱ {att.hoursWorked}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : isAbsent ? (
                    /* Absent Details */
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-950 dark:text-rose-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-800 dark:text-rose-300">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>Absent / Not Reported</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        {att.remarks || 'Uninformed absence recorded by Depot Timekeeper.'}
                      </p>
                    </div>
                  ) : isWeeklyOff ? (
                    /* Weekly Off Details */
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-900 dark:text-purple-200 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <Coffee className="size-3 text-purple-600" />
                        {att.remarks || 'Scheduled Weekly Rest'}
                      </span>
                      <span className="font-mono opacity-80">Roster Rest</span>
                    </div>
                  ) : (
                    /* Leave Details */
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <FileText className="size-3 text-amber-600" />
                        {att.remarks || 'Approved Casual Leave'}
                      </span>
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-300">Sanctioned</span>
                    </div>
                  )}

                  {/* Verification Footer */}
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/50">
                    <span className="truncate">{att.depotLocation}</span>
                    <span className="opacity-80 shrink-0 font-medium">{att.verifiedBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRM END SHIFT DUTY */}
      {/* ============================================================== */}
      {isEndDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogOut className="size-5" />
                <div>
                  <h3 className="text-sm font-black tracking-tight">End Shift Duty</h3>
                  <span className="text-[10px] opacity-90 font-mono">
                    Punch-Out & Shift Closure
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEndDutyModalOpen(false)}
                className="size-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-foreground leading-relaxed">
                Kya aap aaj ki duty end karna chahte hain? Aapka <strong>Punch-Out Time</strong> record ho jayega aur duty status <strong>Shift Completed</strong> mark hoga.
              </p>

              {/* Duty Closing Summary */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conductor:</span>
                  <span className="font-bold text-foreground">{activeDuty.conductorName} ({activeDuty.badgeNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route & Bus:</span>
                  <span className="font-mono font-bold text-foreground">Route {activeDuty.routeNumber} • {activeDuty.busNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Punch In Time:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{todayAttendance?.punchInTime || activeDuty.dutyStartTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Punch Out Time:</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">Now ({new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })})</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/60">
                  <span className="text-muted-foreground">Cash in Leather Bag:</span>
                  <span className="font-mono font-black text-foreground">₹{activeDuty.totalCashCollected}.00</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEndDutyModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border-border font-bold text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={isEndingDuty}
                  onClick={handleConfirmEndDuty}
                  className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
                >
                  {isEndingDuty ? 'Recording Punch-Out...' : 'Confirm End Duty'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
