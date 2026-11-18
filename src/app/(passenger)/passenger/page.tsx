'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDtcStore } from '@/store/useDtcStore';
import { BusCategory, DtcRoute, LiveBus } from '@/types/dtc';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  QrCode,
  Bus,
  Sparkles,
  MapPin,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Plus,
  Minus,
  Navigation,
  Compass,
  Zap,
  ChevronRight,
  Check,
  X,
  ArrowUpDown,
  Users,
  Filter,
} from 'lucide-react';

interface ConnectingBusItem {
  route: DtcRoute;
  routeNumber: string;
  routeName: string;
  busType: BusCategory;
  distanceKm: number;
  fare: number;
  fromStop: string;
  toStop: string;
  liveBus?: LiveBus;
}

export default function PassengerHomePage() {
  const router = useRouter();
  const routes = useDtcStore((state) => state.routes);
  const liveBuses = useDtcStore((state) => state.liveBuses);
  const passengerProfile = useDtcStore((state) => state.passengerProfile);
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const bookPassengerTicket = useDtcStore((state) => state.bookPassengerTicket);
  const issuePinkPass = useDtcStore((state) => state.issuePinkPass);
  const calculateFare = useDtcStore((state) => state.calculateFare);

  // Active ticket check
  const activeTicket = passengerTickets.find((t) => t.status === 'Valid');

  // Master list of all unique bus stops across DTC network
  const allStops = useMemo(() => {
    const set = new Set<string>();
    routes.forEach((r) => {
      r.stops.forEach((s) => set.add(s.name));
    });
    return Array.from(set).sort();
  }, [routes]);

  // Stop-to-Stop Inputs
  const [originStop, setOriginStop] = useState<string>('Saket Crossing');
  const [destinationStop, setDestinationStop] = useState<string>('Janpath / CP');

  // Bus Filter: All | AC Only | Non-AC Only
  const [busClassFilter, setBusClassFilter] = useState<'all' | 'ac' | 'non-ac'>('all');

  // Selected Bus for Booking Modal
  const [selectedBus, setSelectedBus] = useState<ConnectingBusItem | null>(null);
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [isPinkTicket, setIsPinkTicket] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'Wallet' | 'UPI' | 'Card'>('Wallet');

  // Swap From and To Stops
  const handleSwapStops = () => {
    const temp = originStop;
    setOriginStop(destinationStop);
    setDestinationStop(temp);
  };

  // Discover all buses connecting originStop and destinationStop
  const connectingBuses = useMemo<ConnectingBusItem[]>(() => {
    if (!originStop || !destinationStop || originStop === destinationStop) {
      return [];
    }

    const matched: ConnectingBusItem[] = [];

    routes.forEach((route) => {
      const fromIndex = route.stops.findIndex((s) => s.name === originStop);
      const toIndex = route.stops.findIndex((s) => s.name === destinationStop);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        const dist = Math.abs(route.stops[toIndex].distanceKm - route.stops[fromIndex].distanceKm);
        const roundedDist = Math.max(1, Math.round(dist * 10) / 10);
        const fare = calculateFare(route.busType, roundedDist);
        const liveBus = liveBuses.find((b) => b.routeNumber === route.routeNumber);

        matched.push({
          route,
          routeNumber: route.routeNumber,
          routeName: route.routeName,
          busType: route.busType,
          distanceKm: roundedDist,
          fare,
          fromStop: originStop,
          toStop: destinationStop,
          liveBus,
        });
      }
    });

    // Apply AC / Non-AC filter
    return matched.filter((b) => {
      if (busClassFilter === 'ac') {
        return b.busType === 'AC Electric' || b.busType === 'AC Low Floor CNG';
      }
      if (busClassFilter === 'non-ac') {
        return b.busType === 'Non-AC Standard';
      }
      return true;
    });
  }, [routes, originStop, destinationStop, liveBuses, calculateFare, busClassFilter]);

  // Handle bus selection for booking
  const handleSelectBusToBook = (busItem: ConnectingBusItem) => {
    setSelectedBus(busItem);
    setPassengersCount(1);
    setIsPinkTicket(false);
    setShowBookingModal(true);
  };

  // Compute total booking amount
  const { totalFare, farePerPerson } = useMemo(() => {
    if (!selectedBus) return { totalFare: 0, farePerPerson: 0 };
    if (isPinkTicket) return { totalFare: 0, farePerPerson: 0 };
    const perPerson = selectedBus.fare;
    return {
      totalFare: perPerson * passengersCount,
      farePerPerson: perPerson,
    };
  }, [selectedBus, passengersCount, isPinkTicket]);

  // Confirm and generate individual QR tickets
  const handleConfirmBooking = () => {
    if (!selectedBus) return;

    if (isPinkTicket) {
      const ticket = issuePinkPass(selectedBus.routeNumber);
      toast.success('Zero-Fare Pink Ticket generated successfully!');
      setShowBookingModal(false);
      router.push('/passenger/tickets');
      return;
    }

    if (paymentMethod === 'Wallet' && passengerProfile.walletBalance < totalFare) {
      toast.error(`Insufficient wallet balance (₹${passengerProfile.walletBalance}). Please top-up or choose UPI.`);
      return;
    }

    const ticket = bookPassengerTicket({
      origin: originStop,
      destination: destinationStop,
      routeNumber: selectedBus.routeNumber,
      busType: selectedBus.busType,
      passengersCount,
      fare: farePerPerson,
      totalAmount: totalFare,
      paymentMode: paymentMethod,
    });

    toast.success(
      passengersCount > 1
        ? `Booked for ${passengersCount} passengers! ${passengersCount} individual QR codes generated.`
        : `Ticket #${ticket.ticketNumber} generated!`
    );
    setShowBookingModal(false);
    router.push('/passenger/tickets');
  };

  const handleQuickPinkPass = () => {
    issuePinkPass('All Delhi Routes');
    toast.success('Free Pink Ticket issued for today! Check My Tickets.');
    router.push('/passenger/tickets');
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200">
      {/* Commuter Welcome & GPS Location Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            Welcome back 👋
          </span>
          <h2 className="text-lg font-black text-foreground tracking-tight">
            {passengerProfile.name}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border text-[10px] font-medium text-muted-foreground">
          <MapPin className="size-3 text-emerald-600 animate-pulse" />
          <span>INA Colony Metro</span>
        </div>
      </div>

      {/* Active Ticket Notification Banner */}
      {activeTicket && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs text-white shrink-0">
              <QrCode className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/20">
                  Active Journey
                </span>
                <span className="text-[10px] opacity-90 truncate">Route {activeTicket.routeNumber}</span>
                {activeTicket.passengersCount > 1 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-black/25">
                    {activeTicket.passengersCount} QRs
                  </span>
                )}
              </div>
              <p className="text-xs font-bold truncate mt-0.5">
                {activeTicket.sourceStop || activeTicket.boardingStop} ➔ {activeTicket.destinationStop}
              </p>
            </div>
          </div>

          <Link href="/passenger/tickets">
            <Button size="sm" className="bg-white hover:bg-slate-100 text-emerald-800 font-bold text-xs rounded-xl shadow-xs shrink-0 h-8 px-3">
              Show QR
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Action 4-Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            const el = document.getElementById('route-discovery-card');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/50 shadow-2xs transition-all text-center group"
        >
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <QrCode className="size-5" />
          </div>
          <span className="text-[10px] font-bold text-foreground">Book QR</span>
        </button>

        <button
          onClick={handleQuickPinkPass}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 hover:border-pink-500/60 shadow-2xs transition-all text-center group relative overflow-hidden"
        >
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-pink-600 animate-ping" />
          <div className="size-10 rounded-xl bg-pink-500/20 text-pink-700 dark:text-pink-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Sparkles className="size-5" />
          </div>
          <span className="text-[10px] font-bold text-pink-900 dark:text-pink-200">Pink Pass</span>
        </button>

        <Link
          href="/passenger/live"
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-card border border-border/70 hover:border-blue-500/50 shadow-2xs transition-all text-center group"
        >
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Bus className="size-5" />
          </div>
          <span className="text-[10px] font-bold text-foreground">Live Bus</span>
        </Link>

        <Link
          href="/passenger/profile"
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-card border border-border/70 hover:border-purple-500/50 shadow-2xs transition-all text-center group"
        >
          <div className="size-10 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <CreditCard className="size-5" />
          </div>
          <span className="text-[10px] font-bold text-foreground">Top-Up</span>
        </Link>
      </div>

      {/* STOP-TO-STOP AUTO ROUTE DISCOVERY CARD */}
      <Card id="route-discovery-card" className="border-border/90 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-3.5 pb-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-emerald-600" />
              <CardTitle className="text-xs font-bold text-foreground">
                Stop-to-Stop Bus Search
              </CardTitle>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              Live Route Discovery
            </span>
          </div>
          <CardDescription className="text-[11px] text-muted-foreground pt-0.5">
            Boarding aur Destination chuniye — is route ki sari AC & Non-AC buses live milengi
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3.5 space-y-3">
          {/* Stop Selectors with Swap Button */}
          <div className="relative space-y-2">
            {/* From (Boarding) Stop */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                Boarding Stop (From)
              </label>
              <select
                value={originStop}
                onChange={(e) => setOriginStop(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                {allStops.map((stop) => (
                  <option key={`from-${stop}`} value={stop}>
                    {stop}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Swap Stops Button */}
            <div className="flex justify-end pr-3 -my-1 z-10 relative">
              <button
                type="button"
                onClick={handleSwapStops}
                title="Swap From and To stops"
                className="size-7 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-500 transition-colors"
              >
                <ArrowUpDown className="size-3.5" />
              </button>
            </div>

            {/* To (Destination) Stop */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-600" />
                Destination Stop (To)
              </label>
              <select
                value={destinationStop}
                onChange={(e) => setDestinationStop(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                {allStops.map((stop) => (
                  <option key={`to-${stop}`} value={stop}>
                    {stop}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Popular Stops Quick Chips */}
          <div className="space-y-1 pt-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold">Popular Hubs:</span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {[
                { from: 'Saket Crossing', to: 'Janpath / CP' },
                { from: 'Saket Crossing', to: 'Kashmere Gate ISBT' },
                { from: 'Mahipalpur', to: 'Dhaula Kuan' },
                { from: 'AIIMS / Safdarjung', to: 'Janpath / CP' },
                { from: 'Kapashera Border', to: 'Mori Gate Terminal' },
              ].map((routePair, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setOriginStop(routePair.from);
                    setDestinationStop(routePair.to);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-muted/60 hover:bg-muted text-[10px] font-bold text-muted-foreground hover:text-foreground shrink-0 border border-border/60 transition-colors"
                >
                  {routePair.from.split(' ')[0]} ➔ {routePair.to.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONNECTING BUSES LIST (AC + NON-AC) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Bus className="size-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              Available Connecting Buses ({connectingBuses.length})
            </h3>
          </div>

          {/* AC / Non-AC Category Filters */}
          <div className="flex items-center gap-1 bg-muted/70 p-0.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setBusClassFilter('all')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                busClassFilter === 'all'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setBusClassFilter('ac')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                busClassFilter === 'ac'
                  ? 'bg-card text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-muted-foreground'
              }`}
            >
              AC Only
            </button>
            <button
              type="button"
              onClick={() => setBusClassFilter('non-ac')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                busClassFilter === 'non-ac'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground'
              }`}
            >
              Non-AC
            </button>
          </div>
        </div>

        {connectingBuses.length === 0 ? (
          <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-2">
            <AlertCircle className="size-8 text-amber-500 mx-auto" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">No Direct Bus Found</h4>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                No direct bus connects <strong className="text-foreground">{originStop}</strong> to{' '}
                <strong className="text-foreground">{destinationStop}</strong>. Try choosing a major interchange hub like{' '}
                <strong>AIIMS / Safdarjung</strong>, <strong>Saket</strong>, or <strong>Dhaula Kuan</strong>.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOriginStop('Saket Crossing');
                  setDestinationStop('Janpath / CP');
                }}
                className="text-xs rounded-xl"
              >
                Reset to Saket ➔ Janpath
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {connectingBuses.map((bus) => {
              const isAC = bus.busType === 'AC Electric' || bus.busType === 'AC Low Floor CNG';
              return (
                <Card
                  key={`${bus.routeNumber}-${bus.busType}`}
                  className="border-border/80 hover:border-emerald-500/40 shadow-xs rounded-2xl overflow-hidden transition-all bg-card"
                >
                  <CardContent className="p-3.5 space-y-3">
                    {/* Header: Route Number, Category Badge, Live ETA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2.5 py-1 rounded-xl font-black text-sm text-white ${
                            isAC ? 'bg-emerald-700' : 'bg-slate-700'
                          }`}
                        >
                          {bus.routeNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold px-1.5 py-0 ${
                                isAC
                                  ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                                  : 'border-slate-500/40 text-slate-700 dark:text-slate-300 bg-slate-500/10'
                              }`}
                            >
                              {bus.busType}
                            </Badge>
                            {bus.liveBus && (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                                LIVE GPS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground block truncate max-w-[200px]">
                            {bus.routeName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-foreground">
                          ₹{bus.fare}
                        </span>
                        <span className="text-[9px] text-muted-foreground block">per commuter</span>
                      </div>
                    </div>

                    {/* Telemetry info row */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 text-[11px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3 text-emerald-600" />
                        <span>
                          {bus.liveBus
                            ? `Arriving in ${bus.liveBus.etaNextStopMins} mins`
                            : 'Every 10-12 mins'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <span>{bus.distanceKm} km</span>
                        <span>•</span>
                        <span>~{Math.round(bus.distanceKm * 2.2)} mins travel</span>
                      </div>

                      {bus.liveBus && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          {bus.liveBus.occupancyPercent}% crowd
                        </span>
                      )}
                    </div>

                    {/* Book Ticket Button */}
                    <Button
                      onClick={() => handleSelectBusToBook(bus)}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9 shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <span>Select Bus & Book Ticket</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* BOOKING MODAL WITH MULTI-PASSENGER INDIVIDUAL QR NOTICE */}
      {showBookingModal && selectedBus && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded-lg bg-emerald-700 text-white font-black text-xs">
                  {selectedBus.routeNumber}
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    Book Digital QR Ticket
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedBus.busType} • {selectedBus.distanceKm} KM Journey
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="size-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Stop Information */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block">Boarding Stop</span>
                  <span className="font-bold text-foreground truncate block">{originStop}</span>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-border ml-1 pl-3 py-0.5 my-0.5">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {selectedBus.distanceKm} km • Approx. {Math.round(selectedBus.distanceKm * 2.2)} mins
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-rose-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block">Destination Stop</span>
                  <span className="font-bold text-foreground truncate block">{destinationStop}</span>
                </div>
              </div>
            </div>

            {/* Passenger Count Selection */}
            {!isPinkTicket && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Users className="size-3 text-emerald-600" />
                    Number of Passengers
                  </label>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                    ₹{farePerPerson} per commuter
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-foreground block">
                      {passengersCount} {passengersCount === 1 ? 'Passenger' : 'Passengers'}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {passengersCount > 1
                        ? `Generates ${passengersCount} separate QR codes`
                        : 'Single QR code generated'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPassengersCount(Math.max(1, passengersCount - 1))}
                      className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground font-bold hover:bg-muted/80 transition-colors"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="text-sm font-black text-foreground min-w-5 text-center">
                      {passengersCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPassengersCount(Math.min(6, passengersCount + 1))}
                      className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground font-bold hover:bg-muted/80 transition-colors"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Passenger Selector Pills */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">Quick Select:</span>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPassengersCount(num)}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                        passengersCount === num
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {num} {num === 1 ? 'P' : 'Ps'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Passenger QR Explainer Alert */}
            {passengersCount > 1 && !isPinkTicket && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>Individual QR Codes Generated</span>
                </div>
                <p className="text-[10px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                  Har commuter ke liye <strong>alag QR code</strong> banega. Bus conductor aapke mobile se dono/teeno QR alag-alag scan karenge.
                </p>
              </div>
            )}

            {/* Women Free Pink Pass Toggle */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/30 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-pink-600" />
                  <span className="text-xs font-bold text-pink-900 dark:text-pink-200">
                    Women Free Pink Pass
                  </span>
                </div>
                <p className="text-[10px] text-pink-700 dark:text-pink-300">
                  Govt of NCT Delhi Zero-Fare Scheme for Female Commuters
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPinkTicket(!isPinkTicket);
                  if (!isPinkTicket) setPassengersCount(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isPinkTicket
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-card border border-pink-500/40 text-pink-700 dark:text-pink-300'
                }`}
              >
                {isPinkTicket ? 'Selected (₹0)' : 'Apply Pink Pass'}
              </button>
            </div>

            {/* Payment Method Selector */}
            {!isPinkTicket && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Wallet')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      paymentMethod === 'Wallet'
                        ? 'border-emerald-600 bg-emerald-500/10 text-foreground font-bold'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CreditCard className="size-4 text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{passengerProfile.walletBalance}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold block">Fast Wallet</span>
                    <span className="text-[9px] text-muted-foreground">1-Tap Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-emerald-600 bg-emerald-500/10 text-foreground font-bold'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Zap className="size-4 text-blue-600" />
                      <span className="text-[9px] font-bold px-1.5 rounded bg-blue-500/10 text-blue-600">
                        UPI
                      </span>
                    </div>
                    <span className="text-[11px] font-bold block">UPI Apps</span>
                    <span className="text-[9px] text-muted-foreground">GPay / PhonePe</span>
                  </button>
                </div>
              </div>
            )}

            {/* Total Fare & Confirmation Button */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    {isPinkTicket
                      ? 'Zero-Fare Scheme Applied'
                      : `₹${farePerPerson} × ${passengersCount} Commuter${passengersCount > 1 ? 's' : ''}`}
                  </span>
                  <span className="text-xl font-black text-foreground">
                    {isPinkTicket ? 'FREE (₹0.00)' : `₹${totalFare.toFixed(2)}`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                    {passengersCount} Individual QR{passengersCount > 1 ? 's' : ''}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium">Valid for 2 Hours</span>
                </div>
              </div>

              <Button
                onClick={handleConfirmBooking}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl h-11 shadow-sm flex items-center justify-center gap-2"
              >
                <span>
                  {isPinkTicket
                    ? 'Generate Free Pink Ticket'
                    : `Pay ₹${totalFare.toFixed(2)} & Generate ${passengersCount} QR${
                        passengersCount > 1 ? 's' : ''
                      }`}
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
