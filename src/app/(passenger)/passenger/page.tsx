'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDtcStore } from '@/store/useDtcStore';
import { BusCategory } from '@/types/dtc';
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
} from 'lucide-react';

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

  // Booking Form State
  const [selectedRouteNumber, setSelectedRouteNumber] = useState<string>('502');
  const currentRoute = routes.find((r) => r.routeNumber === selectedRouteNumber) || routes[0];

  const [originStop, setOriginStop] = useState<string>(currentRoute?.stops[0]?.name || 'Mehrauli Terminal');
  const [destinationStop, setDestinationStop] = useState<string>(
    currentRoute?.stops[currentRoute.stops.length - 1]?.name || 'Kashmere Gate ISBT'
  );
  const [busCategory, setBusCategory] = useState<BusCategory>('AC Electric');
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [isPinkTicket, setIsPinkTicket] = useState<boolean>(false);

  // Payment Confirmation Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'Wallet' | 'UPI' | 'Card'>('Wallet');

  // Compute Distance & Fare
  const { distanceKm, singleFare, totalAmount } = useMemo(() => {
    if (!currentRoute) return { distanceKm: 10, singleFare: 15, totalAmount: 15 };

    const stop1 = currentRoute.stops.find((s) => s.name === originStop);
    const stop2 = currentRoute.stops.find((s) => s.name === destinationStop);

    const dist = stop1 && stop2 ? Math.abs(stop2.distanceKm - stop1.distanceKm) : 10;
    const roundedDist = Math.max(1, Math.round(dist * 10) / 10);

    if (isPinkTicket) {
      return { distanceKm: roundedDist, singleFare: 0, totalAmount: 0 };
    }

    const fare = calculateFare(busCategory, roundedDist);
    return {
      distanceKm: roundedDist,
      singleFare: fare,
      totalAmount: fare * passengersCount,
    };
  }, [currentRoute, originStop, destinationStop, busCategory, passengersCount, isPinkTicket, calculateFare]);

  // Handle route change
  const handleRouteChange = (routeNum: string) => {
    setSelectedRouteNumber(routeNum);
    const newRoute = routes.find((r) => r.routeNumber === routeNum);
    if (newRoute && newRoute.stops.length > 0) {
      setOriginStop(newRoute.stops[0].name);
      setDestinationStop(newRoute.stops[newRoute.stops.length - 1].name);
      setBusCategory(newRoute.busType);
    }
  };

  const handleBookingSubmit = () => {
    if (originStop === destinationStop) {
      toast.error('Boarding stop and Destination stop cannot be the same.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (isPinkTicket) {
      const ticket = issuePinkPass(selectedRouteNumber);
      toast.success('Zero-Fare Pink Ticket generated successfully!');
      setShowPaymentModal(false);
      router.push('/passenger/tickets');
      return;
    }

    if (paymentMethod === 'Wallet' && passengerProfile.walletBalance < totalAmount) {
      toast.error(`Insufficient wallet balance (₹${passengerProfile.walletBalance}). Please top-up or choose UPI.`);
      return;
    }

    const ticket = bookPassengerTicket({
      origin: originStop,
      destination: destinationStop,
      routeNumber: selectedRouteNumber,
      busType: busCategory,
      passengersCount,
      fare: singleFare,
      totalAmount,
      paymentMode: paymentMethod,
    });

    toast.success(`Ticket #${ticket.ticketNumber} generated!`);
    setShowPaymentModal(false);
    router.push('/passenger/tickets');
  };

  const handleQuickPinkPass = () => {
    issuePinkPass(selectedRouteNumber);
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
            setIsPinkTicket(false);
            window.scrollTo({ top: 380, behavior: 'smooth' });
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

      {/* Instant Journey Booking Card */}
      <Card className="border-border/90 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-3.5 pb-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="size-4 text-emerald-600" />
              <CardTitle className="text-xs font-bold text-foreground">
                Instant Ticket Booking
              </CardTitle>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              Official DTC Tariff
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-3.5 space-y-3">
          {/* Route Selector Chips */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Bus Route
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {routes.map((r) => (
                <button
                  key={r.routeNumber}
                  type="button"
                  onClick={() => handleRouteChange(r.routeNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                    selectedRouteNumber === r.routeNumber
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r.routeNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Boarding and Destination Selectors */}
          <div className="space-y-2 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-600" />
                Boarding Stop (From)
              </label>
              <select
                value={originStop}
                onChange={(e) => setOriginStop(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                {currentRoute?.stops.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.distanceKm} km)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-600" />
                Destination Stop (To)
              </label>
              <select
                value={destinationStop}
                onChange={(e) => setDestinationStop(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                {currentRoute?.stops.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.distanceKm} km)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ticket Type Pills */}
          <div className="space-y-1 pt-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Bus Class & Tariff Scheme
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setBusCategory('AC Electric');
                  setIsPinkTicket(false);
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  busCategory === 'AC Electric' && !isPinkTicket
                    ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-border bg-muted/30 text-muted-foreground text-xs'
                }`}
              >
                <div className="text-[11px] font-bold">AC Bus</div>
                <div className="text-[9px] opacity-80">₹10 – ₹25</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBusCategory('Non-AC Standard');
                  setIsPinkTicket(false);
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  busCategory === 'Non-AC Standard' && !isPinkTicket
                    ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-border bg-muted/30 text-muted-foreground text-xs'
                }`}
              >
                <div className="text-[11px] font-bold">Non-AC</div>
                <div className="text-[9px] opacity-80">₹5 – ₹15</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPinkTicket(true);
                  setPassengersCount(1);
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isPinkTicket
                    ? 'border-pink-600 bg-pink-500/20 text-pink-900 dark:text-pink-200 font-black'
                    : 'border-border bg-muted/30 text-muted-foreground text-xs'
                }`}
              >
                <div className="text-[11px] font-bold">Pink Pass</div>
                <div className="text-[9px] text-pink-700 dark:text-pink-400 font-extrabold">₹0 (Free)</div>
              </button>
            </div>
          </div>

          {/* Passenger Count & Fare Calculation Summary */}
          {!isPinkTicket && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/80">
              <span className="text-xs font-semibold text-muted-foreground">Passengers:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassengersCount(Math.max(1, passengersCount - 1))}
                  className="size-7 rounded-lg bg-card border border-border flex items-center justify-center text-foreground font-bold hover:bg-muted"
                >
                  <Minus className="size-3" />
                </button>
                <span className="text-xs font-black text-foreground min-w-4 text-center">
                  {passengersCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPassengersCount(Math.min(6, passengersCount + 1))}
                  className="size-7 rounded-lg bg-card border border-border flex items-center justify-center text-foreground font-bold hover:bg-muted"
                >
                  <Plus className="size-3" />
                </button>
              </div>
            </div>
          )}

          {/* Live Calculated Price & Action Button */}
          <div className="pt-2 border-t border-border/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold block">
                {distanceKm} km • {isPinkTicket ? 'Zero Fare' : `₹${singleFare}/person`}
              </span>
              <span className="text-xl font-black text-foreground">
                {isPinkTicket ? 'FREE (₹0)' : `₹${totalAmount.toFixed(2)}`}
              </span>
            </div>

            <Button
              onClick={handleBookingSubmit}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm gap-1.5"
            >
              <span>{isPinkTicket ? 'Issue Pink Pass' : 'Pay & Book QR'}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Nearby Bus Telemetry Carousel */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Compass className="size-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
            Nearby Buses (Live GPS)
          </h3>
          <Link href="/passenger/live" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            View All ➔
          </Link>
        </div>

        <div className="space-y-2">
          {liveBuses.slice(0, 3).map((bus) => (
            <div
              key={bus.id}
              className="p-3 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  {bus.routeNumber}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">{bus.busNumber}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-medium">
                      {bus.busType}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    Towards {bus.nextStop}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">
                  {bus.etaNextStopMins} mins
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold">
                  {bus.occupancyPercent}% full
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment & QR Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2.5 border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Confirm Ticket Payment
                </h3>
                <span className="text-[10px] text-muted-foreground">
                  Route {selectedRouteNumber} • {distanceKm} KM
                </span>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Journey Summary */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span className="font-bold text-foreground">{originStop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-bold text-foreground">{destinationStop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bus Class:</span>
                <span className="font-bold text-foreground">{busCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passengers:</span>
                <span className="font-bold text-foreground">{passengersCount}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border font-bold text-foreground">
                <span>Total Amount:</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-sm">
                  {isPinkTicket ? 'FREE (₹0)' : `₹${totalAmount.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Select Payment Method */}
            {!isPinkTicket && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Choose Payment Method
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Wallet')}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      paymentMethod === 'Wallet'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-emerald-600" />
                      <span>DTC Commuter Wallet</span>
                    </div>
                    <span className="font-bold">₹{passengerProfile.walletBalance}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      paymentMethod === 'UPI'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="size-4 text-blue-600" />
                      <span>Instant UPI / GPay / Paytm</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Fast Pay</span>
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={handleConfirmPayment}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-10 shadow-sm"
            >
              {isPinkTicket ? 'Confirm Free Pink Pass' : `Pay ₹${totalAmount.toFixed(2)} & Generate QR`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
