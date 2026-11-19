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
  BellRing,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  ChevronRight,
  Info,
  Building2,
  Calendar,
  Smartphone,
} from 'lucide-react';

export default function ConductorDashboardPage() {
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const conductorAttendances = useDtcStore((state) => state.conductorAttendances);
  const punchInAttendance = useDtcStore((state) => state.punchInAttendance);
  const notices = useDtcStore((state) => state.notices);
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

  // Active Notices for Conductors
  const conductorNotices = notices.filter(
    (n) => n.isActive && (n.targetAudience === 'Conductors & Drivers' || n.targetAudience === 'All')
  );

  // Notice Modal State
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [acknowledgedNotices, setAcknowledgedNotices] = useState<string[]>([]);

  // Attendance Modal & Punch-In State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  const [isPunchInSubmitting, setIsPunchInSubmitting] = useState<boolean>(false);

  // Today's Conductor Attendance
  const currentAttendance = conductorAttendances.find(
    (a) => a.badgeNumber === activeDuty.badgeNumber && a.status === 'Present'
  );
  const isOnDuty = activeDuty.status === 'On Duty' && currentAttendance;

  // Handle Conductor Punch-In / Start Duty
  const handlePunchIn = () => {
    setIsPunchInSubmitting(true);
    setTimeout(() => {
      punchInAttendance({
        dutyId: activeDuty.id,
        location: `${activeDuty.depot} (Gate 2 Biometric & GPS)`,
        shift: activeDuty.shift,
      });
      setIsPunchInSubmitting(false);
      toast.success(
        `Duty Started! Attendance marked as PRESENT for ${activeDuty.conductorName} (${activeDuty.badgeNumber})`
      );
    }, 700);
  };

  return (
    <div className="p-3.5 space-y-3 animate-in fade-in duration-200">
      {/* 1. OFFICIAL DTC NOTICE FOR CONDUCTORS (From Admin Panel) */}
      {conductorNotices.length > 0 && (
        <div className="space-y-1.5">
          {conductorNotices.map((notice) => {
            const isAcknowledged = acknowledgedNotices.includes(notice.id);
            if (isAcknowledged) return null;

            const isUrgent = notice.priority === 'Urgent';
            const isHigh = notice.priority === 'High';

            return (
              <div
                key={notice.id}
                className={`p-3 rounded-2xl border shadow-xs transition-all ${
                  isUrgent
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
                    : isHigh
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isUrgent
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isHigh
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <BellRing className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          className={`text-[8px] font-black uppercase tracking-wider py-0 px-1.5 ${
                            isUrgent
                              ? 'bg-rose-600 text-white'
                              : isHigh
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {notice.priority} NOTICE
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {notice.noticeNumber}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold leading-tight mt-0.5 text-foreground line-clamp-1">
                        {notice.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedNotice(notice)}
                    className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 flex items-center gap-0.5 pt-0.5"
                  >
                    <span>View</span>
                    <ChevronRight className="size-3" />
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 pl-9">
                  {notice.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. CONDUCTOR DUTY STATUS & ATTENDANCE RECORD BAR */}
      <Card className="bg-card border-border shadow-xs rounded-2xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`size-9 rounded-xl flex items-center justify-center ${
                isOnDuty
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}
            >
              <CalendarCheck className="size-4.5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-foreground">
                  {isOnDuty ? 'Attendance: Present' : 'Shift Check-In Pending'}
                </span>
                <span
                  className={`size-2 rounded-full ${
                    isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground block font-mono">
                {isOnDuty
                  ? `Punched in: ${currentAttendance?.punchInTime || activeDuty.dutyStartTime} • ${activeDuty.depot}`
                  : `${activeDuty.shift.split(' ')[0]} Shift • Reporting: ${activeDuty.depot}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isOnDuty ? (
              <Button
                type="button"
                size="sm"
                disabled={isPunchInSubmitting}
                onClick={handlePunchIn}
                className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-xs"
              >
                <span>{isPunchInSubmitting ? 'Punching...' : 'Punch In'}</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAttendanceModalOpen(true)}
                className="h-7 px-2.5 rounded-xl border-border bg-muted/40 hover:bg-muted text-foreground font-bold text-[10px]"
              >
                <span>Log ({conductorAttendances.length})</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 3. CURRENT BUS STOP STAGE & HALTING STEPPER */}
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

      {/* 4. SHIFT PASSENGER & DUTY METRICS */}
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

      {/* 5. RECENT ACTIVITY LOGS */}
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

      {/* 6. MODAL: DETAILED OFFICIAL NOTICE DIALOG */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-5" />
                <div>
                  <h3 className="text-xs font-black tracking-tight">DTC Operational Notice</h3>
                  <span className="text-[10px] opacity-90 font-mono">
                    {selectedNotice.noticeNumber}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="size-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-[9px] font-bold ${
                    selectedNotice.priority === 'Urgent'
                      ? 'bg-rose-600 text-white'
                      : selectedNotice.priority === 'High'
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {selectedNotice.priority} PRIORITY
                </Badge>
                <Badge variant="outline" className="text-[9px] font-mono">
                  {selectedNotice.category}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-black text-foreground">
                  {selectedNotice.title}
                </h4>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Published: {selectedNotice.publishedAt} • Valid Until: {selectedNotice.validUntil || 'Current Shift'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs text-foreground leading-relaxed">
                {selectedNotice.content}
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="flex justify-between">
                  <span>Issued Authority:</span>
                  <strong className="text-foreground">{selectedNotice.issuedBy || 'Traffic Operations Headquarters'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Target Crew:</span>
                  <span>{selectedNotice.targetAudience}</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setAcknowledgedNotices((prev) => [...prev, selectedNotice.id]);
                  setSelectedNotice(null);
                  toast.success('Notice Acknowledged & Signed');
                }}
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                <span>Acknowledge Notice</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: CONDUCTOR ATTENDANCE RECORD LOG */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[85vh]">
            <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="size-5" />
                <div>
                  <h3 className="text-xs font-black tracking-tight">Conductor Attendance Log</h3>
                  <span className="text-[10px] opacity-90 font-mono">
                    {activeDuty.conductorName} ({activeDuty.badgeNumber})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="size-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-3.5 space-y-2.5 overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 border-b border-border font-bold uppercase">
                <span>Duty Date & Shift</span>
                <span>Check-in / Status</span>
              </div>

              <div className="space-y-2">
                {conductorAttendances.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-2xl bg-card border border-border text-xs space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Calendar className="size-3.5 text-emerald-600" />
                        <span>{att.date}</span>
                      </div>
                      <Badge
                        className={`text-[9px] font-bold ${
                          att.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/20'
                        }`}
                      >
                        {att.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground font-mono">
                      <div>
                        <span>Punch In: </span>
                        <strong className="text-foreground">{att.punchInTime}</strong>
                      </div>
                      <div>
                        <span>Punch Out: </span>
                        <strong className="text-foreground">{att.punchOutTime || 'Active Duty'}</strong>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/60 flex items-center justify-between">
                      <span className="truncate">{att.depotLocation}</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                        Route {att.routeNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
