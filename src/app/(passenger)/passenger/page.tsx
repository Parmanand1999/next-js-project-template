'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDtcStore } from '@/store/useDtcStore';
import { BusCategory, DtcRoute, LiveBus, NearestStopInfo } from '@/types/dtc';
import {
  findNearestStops,
  COMMUTER_LOCATION_PRESETS,
  CommuterLocationPreset,
  calculateHaversineDistanceMeters,
  formatDistance,
  calculateWalkingMinutes,
  DTC_STOP_COORDINATES,
} from '@/lib/geoUtils';
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
  Navigation2,
  Crosshair,
  Footprints,
} from 'lucide-react';

interface ConnectingBusItem {
  id: string;
  route: DtcRoute;
  routeNumber: string;
  routeName: string;
  busType: BusCategory;
  distanceKm: number;
  fare: number;
  fromStop: string;
  toStop: string;
  distanceFromUserMeters: number;
  distanceFromUserFormatted: string;
  walkingMinutesFromUser: number;
  stopLandmark?: string;
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

  // Current Commuter Location (Simulated/Device location when passenger is not on bus stop)
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
    isCustomGps?: boolean;
  }>({
    lat: 28.5718,
    lng: 77.2085,
    label: 'Dilli Haat / Kidwai Nagar (INA Market)',
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);

  // Compute 4 Nearest Stops from commuter's current position
  const nearestStops = useMemo<NearestStopInfo[]>(() => {
    return findNearestStops(userLocation.lat, userLocation.lng, 4);
  }, [userLocation]);

  // Stop-to-Stop Inputs
  // Special value 'ALL_NEARBY' allows searching across all nearest stops simultaneously
  const [originStop, setOriginStop] = useState<string>('ALL_NEARBY');
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
    if (originStop === 'ALL_NEARBY') {
      const firstStop = nearestStops[0]?.name || 'Saket Crossing';
      setOriginStop(destinationStop);
      setDestinationStop(firstStop);
    } else {
      const temp = originStop;
      setOriginStop(destinationStop);
      setDestinationStop(temp);
    }
  };

  // Auto-Detect Current GPS Location & Auto-Select Nearest Bus Stop
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
            label: 'Your Current Live Location (GPS)',
            isCustomGps: true,
          });
          const computed = findNearestStops(latitude, longitude, 4);
          if (computed.length > 0) {
            setOriginStop('ALL_NEARBY');
            toast.success(`Nearest stops located around you: ${computed[0].name} (${computed[0].distanceFormatted} away)`);
          }
          setIsLocating(false);
        },
        () => {
          const fallback = COMMUTER_LOCATION_PRESETS[0];
          setUserLocation({
            lat: fallback.lat,
            lng: fallback.lng,
            label: fallback.label,
          });
          setOriginStop('ALL_NEARBY');
          toast.info(`Current Location: ${fallback.label}. Nearest stop: ${nearestStops[0]?.name} (${nearestStops[0]?.distanceFormatted})`);
          setIsLocating(false);
        },
        { timeout: 6000 }
      );
    } else {
      const fallback = COMMUTER_LOCATION_PRESETS[0];
      setUserLocation({
        lat: fallback.lat,
        lng: fallback.lng,
        label: fallback.label,
      });
      setOriginStop('ALL_NEARBY');
      setIsLocating(false);
    }
  };

  // Change Commuter Location to a Preset (e.g. at Select Citywalk, Aerocity, AIIMS, etc.)
  const handleSelectPresetLocation = (preset: CommuterLocationPreset) => {
    setUserLocation({
      lat: preset.lat,
      lng: preset.lng,
      label: preset.label,
    });
    setOriginStop('ALL_NEARBY');
    const computed = findNearestStops(preset.lat, preset.lng, 4);
    toast.success(`Location set to ${preset.label}. Nearest stops updated!`);
    setShowLocationPicker(false);
  };

  // Discover all buses connecting originStop (or all nearest stops) to destinationStop
  const connectingBuses = useMemo<ConnectingBusItem[]>(() => {
    if (!destinationStop) return [];

    const matched: ConnectingBusItem[] = [];

    // Determine candidate boarding stops: either specific originStop or all nearestStops
    const candidateStops: { name: string; distMeters: number; landmark?: string }[] = [];

    if (originStop === 'ALL_NEARBY') {
      nearestStops.forEach((s) => {
        candidateStops.push({
          name: s.name,
          distMeters: s.distanceMeters,
          landmark: s.landmark,
        });
      });
    } else {
      const coords = DTC_STOP_COORDINATES[originStop];
      const dist = coords
        ? calculateHaversineDistanceMeters(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
        : 350;
      candidateStops.push({
        name: originStop,
        distMeters: dist,
        landmark: coords?.landmark,
      });
    }

    // For each candidate boarding stop, find connecting routes to destinationStop
    candidateStops.forEach((candStop) => {
      if (candStop.name === destinationStop) return;

      routes.forEach((route) => {
        const fromIndex = route.stops.findIndex((s) => s.name === candStop.name);
        const toIndex = route.stops.findIndex((s) => s.name === destinationStop);

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          const dist = Math.abs(route.stops[toIndex].distanceKm - route.stops[fromIndex].distanceKm);
          const roundedDist = Math.max(1, Math.round(dist * 10) / 10);
          const fare = calculateFare(route.busType, roundedDist);
          const liveBus = liveBuses.find((b) => b.routeNumber === route.routeNumber);
          const walkMins = calculateWalkingMinutes(candStop.distMeters);

          matched.push({
            id: `${route.routeNumber}-${route.busType}-${candStop.name}`,
            route,
            routeNumber: route.routeNumber,
            routeName: route.routeName,
            busType: route.busType,
            distanceKm: roundedDist,
            fare,
            fromStop: candStop.name,
            toStop: destinationStop,
            distanceFromUserMeters: candStop.distMeters,
            distanceFromUserFormatted: formatDistance(candStop.distMeters),
            walkingMinutesFromUser: walkMins,
            stopLandmark: candStop.landmark,
            liveBus,
          });
        }
      });
    });

    // Filter by category (All, AC, Non-AC)
    const filtered = matched.filter((b) => {
      if (busClassFilter === 'ac') {
        return b.busType === 'AC Electric' || b.busType === 'AC Low Floor CNG';
      }
      if (busClassFilter === 'non-ac') {
        return b.busType === 'Non-AC Standard';
      }
      return true;
    });

    // Sort by shortest walking distance from user, then live bus arrival
    return filtered.sort((a, b) => {
      if (a.distanceFromUserMeters !== b.distanceFromUserMeters) {
        return a.distanceFromUserMeters - b.distanceFromUserMeters;
      }
      return a.fare - b.fare;
    });
  }, [routes, originStop, destinationStop, nearestStops, userLocation, liveBuses, calculateFare, busClassFilter]);

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
      origin: selectedBus.fromStop,
      destination: selectedBus.toStop,
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

        {/* Clickable GPS Location pill */}
        <button
          onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/70 hover:bg-muted border border-border text-[10px] font-medium text-foreground transition-colors shadow-2xs group"
          title="Click to change your current location"
        >
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[125px] font-bold">{userLocation.label.split('/')[0]}</span>
          <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold group-hover:underline">
            Change
          </span>
        </button>
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
          {/* Boarding Stop Field with Nearest Stops Displayed Right Nearby */}
          <div className="space-y-2">
            <div className="space-y-1">
              {/* Header Label with GPS Button */}
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                  Boarding Stop (From)
                </label>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                  title="Auto-detect nearest bus stop from your current location"
                >
                  <Crosshair className={`size-3 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Near Me (GPS)'}</span>
                </button>
              </div>

              {/* NEAREST STOPS DIRECTLY DISPLAYED NEXT TO BOARDING STOP FIELD */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/25">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                    <Navigation2 className="size-3 text-emerald-600 rotate-45" />
                    Nearest Bus Stops To You:
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    from {userLocation.label.split('/')[0]}
                  </span>
                </div>

                {/* Horizontal Quick-Select Nearest Stops Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    type="button"
                    onClick={() => setOriginStop('ALL_NEARBY')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border shrink-0 transition-all ${
                      originStop === 'ALL_NEARBY'
                        ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    ✨ All Nearest Stops ({nearestStops.length})
                  </button>

                  {nearestStops.map((stop) => (
                    <button
                      key={stop.name}
                      type="button"
                      onClick={() => setOriginStop(stop.name)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border shrink-0 transition-all flex items-center gap-1 ${
                        originStop === stop.name
                          ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                          : 'bg-card text-muted-foreground border-border hover:bg-muted'
                      }`}
                    >
                      <span>{stop.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 font-bold">
                        {stop.distanceFormatted}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Boarding Stop Select Dropdown */}
              <select
                value={originStop}
                onChange={(e) => setOriginStop(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                <option value="ALL_NEARBY">
                  ✨ All Nearest Stops (Auto-discover buses across nearest stops)
                </option>
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

            {/* Destination Stop (To) */}
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

          {/* Popular Destination Hubs */}
          <div className="space-y-1 pt-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold">Popular Destinations:</span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {[
                'Janpath / CP',
                'Kashmere Gate ISBT',
                'Dhaula Kuan',
                'AIIMS / Safdarjung',
                'Old Delhi Railway Station',
              ].map((dest, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDestinationStop(dest)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 border transition-colors ${
                    destinationStop === dest
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground border-border/60'
                  }`}
                >
                  ➔ {dest.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AVAILABLE CONNECTING BUSES LIST (EXPLICIT STOP & DISTANCE BREAKDOWN) */}
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
                No direct bus found to <strong className="text-foreground">{destinationStop}</strong> from selected stops.
                Try choosing another nearby stop or an interchange hub like <strong>AIIMS</strong>, <strong>Saket</strong>, or <strong>Dhaula Kuan</strong>.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOriginStop('ALL_NEARBY');
                  setDestinationStop('Janpath / CP');
                }}
                className="text-xs rounded-xl"
              >
                Reset to All Nearest Stops ➔ Janpath
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {connectingBuses.map((bus) => {
              const isAC = bus.busType === 'AC Electric' || bus.busType === 'AC Low Floor CNG';
              const walkMins = bus.walkingMinutesFromUser;
              const busEta = bus.liveBus?.etaNextStopMins;
              const willCatchOnTime = busEta !== undefined ? busEta >= walkMins : true;

              return (
                <Card
                  key={bus.id}
                  className="border-border/80 hover:border-emerald-500/40 shadow-xs rounded-2xl overflow-hidden transition-all bg-card"
                >
                  {/* Distinct Boarding Stop & Exact Distance Header */}
                  <div className="px-3.5 py-2 bg-muted/50 border-b border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="size-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px] text-muted-foreground truncate">
                        Board at:{' '}
                        <strong className="text-foreground font-black">{bus.fromStop}</strong>
                      </span>
                    </div>

                    <Badge className="bg-emerald-700 text-white font-black text-[9px] px-2 py-0.5 shrink-0">
                      📍 {bus.distanceFromUserFormatted} doori (~{bus.walkingMinutesFromUser}m walk)
                    </Badge>
                  </div>

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
                        <span>~{Math.round(bus.distanceKm * 2.2)} mins bus run</span>
                      </div>

                      {bus.liveBus && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          {bus.liveBus.occupancyPercent}% crowd
                        </span>
                      )}
                    </div>

                    {/* Walking Feasibility vs Live Bus Arrival */}
                    {busEta !== undefined && (
                      <div
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-between ${
                          willCatchOnTime
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {willCatchOnTime ? '🟢' : '🟡'}
                          {willCatchOnTime
                            ? `Bus arrives in ${busEta}m • Walk is ${walkMins}m (Aaram se catch kar lenge)`
                            : `Bus arrives in ${busEta}m • Walk is ${walkMins}m (Thoda tez chalna hoga)`}
                        </span>
                        <span className="text-[9px] opacity-80">
                          {bus.distanceFromUserFormatted} doori
                        </span>
                      </div>
                    )}

                    {/* Select Bus & Book Ticket Button */}
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

      {/* CHANGE MY LOCATION MODAL (When commuter is elsewhere in city) */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b pb-2.5 border-border">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-emerald-600" />
                <h3 className="text-xs font-black text-foreground">
                  Select Your Current Location
                </h3>
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="size-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Aap Delhi me jaha bhi hain, waha ke sabse nazdeek bus stop ki doori auto-calculate hogi:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowLocationPicker(false);
                  handleUseCurrentLocation();
                }}
                className="w-full p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Crosshair className="size-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Use Device Live GPS
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Auto-detect using phone sensor
                    </span>
                  </div>
                </div>
                <Badge className="bg-emerald-700 text-white text-[9px]">Live GPS</Badge>
              </button>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Popular Locations In Delhi
                </span>
                {COMMUTER_LOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPresetLocation(preset)}
                    className="w-full p-2.5 rounded-xl border border-border hover:border-emerald-500/50 bg-card hover:bg-muted/40 text-left flex items-center justify-between transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {preset.area}
                      </span>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL WITH EXACT DEPARTURE STOP & DISTANCE HIGHLIGHTED */}
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
                    Confirm Bus Booking
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

            {/* EXACT STOP & WALKING DISTANCE ADVISORY CARD */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-black text-foreground">
                    Bus Departure Stop: {selectedBus.fromStop}
                  </span>
                </div>
                <Badge className="bg-emerald-700 text-white font-black text-[10px] px-2 py-0.5">
                  {selectedBus.distanceFromUserFormatted} doori
                </Badge>
              </div>

              <div className="p-2.5 rounded-xl bg-card/80 border border-border/60 text-xs space-y-1">
                <p className="leading-snug text-muted-foreground">
                  Is bus ko pakadne ke liye aapko{' '}
                  <strong className="text-foreground">{selectedBus.fromStop}</strong> stop par jana hoga.
                  Aapki current location se yeh stop lagbhag{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {selectedBus.distanceFromUserFormatted}
                  </strong>{' '}
                  door hai (~
                  <strong className="text-foreground">
                    {selectedBus.walkingMinutesFromUser} min paidal
                  </strong>{' '}
                  walk).
                </p>
                {selectedBus.stopLandmark && (
                  <span className="text-[10px] text-muted-foreground block pt-0.5">
                    📍 Landmark: {selectedBus.stopLandmark}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-black text-foreground">{selectedBus.toStop}</span>
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
