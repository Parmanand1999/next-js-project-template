'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Search,
  ChevronDown,
  ChevronUp,
  Lock,
  Smartphone,
  Building2,
} from 'lucide-react';

const UPI_APP_OPTIONS = [
  {
    id: 'gpay',
    name: 'Google Pay',
    shortName: 'GPay',
    iconBg: 'bg-emerald-600',
    tag: 'Popular',
    upiVpa: 'priya.sharma@okaxis',
    bank: 'State Bank of India •••• 4820',
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    shortName: 'Paytm',
    iconBg: 'bg-sky-600',
    tag: 'Instant',
    upiVpa: '9811234567@paytm',
    bank: 'Paytm Payments Bank •••• 9102',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    shortName: 'PhonePe',
    iconBg: 'bg-purple-600',
    tag: 'Fast',
    upiVpa: '9811234567@ybl',
    bank: 'HDFC Bank •••• 3314',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    shortName: 'BHIM',
    iconBg: 'bg-amber-600',
    tag: 'Govt NPCI',
    upiVpa: 'priya@upi',
    bank: 'Punjab National Bank •••• 8841',
  },
] as const;

type UpiAppId = (typeof UPI_APP_OPTIONS)[number]['id'];

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
  otherNearbyStops?: { name: string; distanceFormatted: string }[];
}

interface TransitLeg {
  route: DtcRoute;
  routeNumber: string;
  routeName: string;
  busType: BusCategory;
  fromStop: string;
  toStop: string;
  distanceKm: number;
  fare: number;
  liveBus?: LiveBus;
  etaMins: number;
  stopsCount: number;
}

interface ConnectingTransitRoute {
  id: string;
  leg1: TransitLeg;
  leg2: TransitLeg;
  interchangeStop: string;
  totalDistanceKm: number;
  totalFare: number;
  totalEstDurationMins: number;
  walkToOriginMeters: number;
  walkToOriginFormatted: string;
  walkToOriginMins: number;
}

export default function PassengerHomePage() {
  const router = useRouter();
  const routes = useDtcStore((state) => state.routes);
  const liveBuses = useDtcStore((state) => state.liveBuses);
  const passengerProfile = useDtcStore((state) => state.passengerProfile);
  const passengerTickets = useDtcStore((state) => state.passengerTickets);
  const bookPassengerTicket = useDtcStore((state) => state.bookPassengerTicket);
  const issuePinkPass = useDtcStore((state) => state.issuePinkPass);
  const issueDtcPass = useDtcStore((state) => state.issueDtcPass);
  const calculateFare = useDtcStore((state) => state.calculateFare);

  // Live clock for booking modal
  const [bookingNow, setBookingNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setBookingNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Search & Select State for Boarding Stop (From)
  const [originStop, setOriginStop] = useState<string>('ALL_NEARBY');
  const [fromSearchQuery, setFromSearchQuery] = useState<string>('✨ All Nearest Stops');
  const [isFromFocused, setIsFromFocused] = useState<boolean>(false);

  // Search & Select State for Destination Stop (To)
  const [destinationStop, setDestinationStop] = useState<string>('Janpath / CP');
  const [toSearchQuery, setToSearchQuery] = useState<string>('Janpath / CP');
  const [isToFocused, setIsToFocused] = useState<boolean>(false);

  // Refs for click outside handling
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setIsFromFocused(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setIsToFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered stops for From (Boarding Stop) field
  const filteredFromStops = useMemo(() => {
    const q = fromSearchQuery.toLowerCase().trim();
    if (!q || q === '✨ all nearest stops' || q === 'all') {
      return allStops;
    }
    return allStops.filter((s) => s.toLowerCase().includes(q));
  }, [allStops, fromSearchQuery]);

  // Filtered stops for To (Destination Stop) field
  const filteredToStops = useMemo(() => {
    const q = toSearchQuery.toLowerCase().trim();
    if (!q) return allStops;
    return allStops.filter((s) => s.toLowerCase().includes(q));
  }, [allStops, toSearchQuery]);

  // Bus Filter: All | AC Only | Non-AC Only
  const [busClassFilter, setBusClassFilter] = useState<'all' | 'ac' | 'non-ac'>('all');

  // Expanded Bus Card for Departure/Route details
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);

  // Selected Bus or Transit Route for Booking Modal
  const [selectedBus, setSelectedBus] = useState<ConnectingBusItem | null>(null);
  const [selectedTransitRoute, setSelectedTransitRoute] = useState<ConnectingTransitRoute | null>(null);
  const [adultCount, setAdultCount] = useState<number>(1);
  const [childCount, setChildCount] = useState<number>(0);
  const [isPinkTicket, setIsPinkTicket] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiAppId>('gpay');
  const [showUpiModal, setShowUpiModal] = useState<boolean>(false);
  const [upiStep, setUpiStep] = useState<'PIN' | 'PROCESSING' | 'SUCCESS'>('PIN');
  const [upiPin, setUpiPin] = useState<string>('');
  const [selectedPassBooking, setSelectedPassBooking] = useState<{
    passType: 'Daily Non-AC' | 'Daily AC';
    cost: number;
  } | null>(null);

  const handleInitiatePassBooking = (passType: 'Daily Non-AC' | 'Daily AC', cost: number) => {
    setSelectedBus(null);
    setSelectedTransitRoute(null);
    setSelectedPassBooking({ passType, cost });
    setUpiPin('');
    setUpiStep('PIN');
    setShowUpiModal(true);
  };

  // Swap From and To Stops
  const handleSwapStops = () => {
    if (originStop === 'ALL_NEARBY') {
      const firstNearby = nearestStops[0]?.name || 'Saket Crossing';
      const prevDest = destinationStop;
      setOriginStop(prevDest);
      setFromSearchQuery(prevDest);
      setDestinationStop(firstNearby);
      setToSearchQuery(firstNearby);
    } else {
      const prevOrigin = originStop;
      const prevDest = destinationStop;
      setOriginStop(prevDest);
      setFromSearchQuery(prevDest);
      setDestinationStop(prevOrigin);
      setToSearchQuery(prevOrigin);
    }
  };

  // Select a boarding stop from search/list
  const handleSelectOriginStop = (stopName: string) => {
    if (stopName === 'ALL_NEARBY') {
      setOriginStop('ALL_NEARBY');
      setFromSearchQuery('✨ All Nearest Stops');
    } else {
      setOriginStop(stopName);
      setFromSearchQuery(stopName);
    }
    setIsFromFocused(false);
  };

  // Select a destination stop from search/list
  const handleSelectDestinationStop = (stopName: string) => {
    setDestinationStop(stopName);
    setToSearchQuery(stopName);
    setIsToFocused(false);
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
            label: 'Your Live Device Location (GPS)',
            isCustomGps: true,
          });
          const computed = findNearestStops(latitude, longitude, 4);
          if (computed.length > 0) {
            setOriginStop('ALL_NEARBY');
            setFromSearchQuery('✨ All Nearest Stops');
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
          setFromSearchQuery('✨ All Nearest Stops');
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
      setFromSearchQuery('✨ All Nearest Stops');
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
    setFromSearchQuery('✨ All Nearest Stops');
    toast.success(`Location set to ${preset.label}. Nearest stops updated!`);
    setShowLocationPicker(false);
  };

  // Candidate Boarding Stops for originStop (shared by direct & connecting algorithms)
  const candidateOrigins = useMemo<{ name: string; distMeters: number; landmark?: string }[]>(() => {
    if (originStop === 'ALL_NEARBY') {
      return nearestStops.map((s) => ({
        name: s.name,
        distMeters: s.distanceMeters,
        landmark: s.landmark,
      }));
    }
    const coords = DTC_STOP_COORDINATES[originStop];
    const dist = coords
      ? calculateHaversineDistanceMeters(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
      : 350;
    return [{
      name: originStop,
      distMeters: dist,
      landmark: coords?.landmark,
    }];
  }, [originStop, nearestStops, userLocation]);

  // Discover all unique buses connecting originStop (or all nearest stops) to destinationStop
  // Deduplicates routes so each bus only appears once, selecting the best (closest) boarding stop to commuter
  const connectingBuses = useMemo<ConnectingBusItem[]>(() => {
    if (!destinationStop) return [];

    const busMap = new Map<string, ConnectingBusItem>();

    // For each candidate boarding stop, find connecting routes to destinationStop
    candidateOrigins.forEach((candStop) => {
      if (candStop.name === destinationStop) return;

      routes.forEach((route) => {
        const fromIndex = route.stops.findIndex((s) => s.name === candStop.name);
        const toIndex = route.stops.findIndex((s) => s.name === destinationStop);

        // Check if route serves both stops and travels in forward direction
        if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          const dist = Math.abs(route.stops[toIndex].distanceKm - route.stops[fromIndex].distanceKm);
          const roundedDist = Math.max(1, Math.round(dist * 10) / 10);
          const fare = calculateFare(route.busType, roundedDist);
          const walkMins = calculateWalkingMinutes(candStop.distMeters);

          // Find ALL active live buses for this route (or fallback to route-level item)
          const routeLiveBuses = liveBuses.filter((b) => b.routeNumber === route.routeNumber);
          const busesToProcess: (LiveBus | undefined)[] = routeLiveBuses.length > 0 ? routeLiveBuses : [undefined];

          busesToProcess.forEach((liveBus) => {
            const busKey = liveBus ? `${route.routeNumber}-${liveBus.id}` : `${route.routeNumber}-${route.busType}`;
            const existing = busMap.get(busKey);

            if (!existing) {
              busMap.set(busKey, {
                id: busKey,
                route,
                routeNumber: route.routeNumber,
                routeName: route.routeName,
                busType: liveBus?.busType || route.busType,
                distanceKm: roundedDist,
                fare,
                fromStop: candStop.name,
                toStop: destinationStop,
                distanceFromUserMeters: candStop.distMeters,
                distanceFromUserFormatted: formatDistance(candStop.distMeters),
                walkingMinutesFromUser: walkMins,
                stopLandmark: candStop.landmark,
                liveBus,
                otherNearbyStops: [],
              });
            } else if (candStop.distMeters < existing.distanceFromUserMeters) {
              existing.fromStop = candStop.name;
              existing.distanceKm = roundedDist;
              existing.fare = fare;
              existing.distanceFromUserMeters = candStop.distMeters;
              existing.distanceFromUserFormatted = formatDistance(candStop.distMeters);
              existing.walkingMinutesFromUser = walkMins;
              existing.stopLandmark = candStop.landmark;
            }
          });
        }
      });
    });

    const matched = Array.from(busMap.values());

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

    // Sort by earliest arrival ETA, then walking distance
    return filtered.sort((a, b) => {
      const etaA = a.liveBus?.etaNextStopMins ?? 999;
      const etaB = b.liveBus?.etaNextStopMins ?? 999;
      if (etaA !== etaB) return etaA - etaB;
      return a.distanceFromUserMeters - b.distanceFromUserMeters;
    });
  }, [routes, destinationStop, candidateOrigins, liveBuses, calculateFare, busClassFilter]);

  // Discover 2-Bus Connecting Routes (1 Transfer at an interchange stop)
  const connectingTransitRoutes = useMemo<ConnectingTransitRoute[]>(() => {
    if (!destinationStop) return [];

    const results: ConnectingTransitRoute[] = [];
    const seenCombos = new Set<string>();

    candidateOrigins.forEach((candOrigin) => {
      if (candOrigin.name === destinationStop) return;

      routes.forEach((route1) => {
        const fromIdx1 = route1.stops.findIndex((s) => s.name === candOrigin.name);
        if (fromIdx1 === -1) return;

        for (let i = fromIdx1 + 1; i < route1.stops.length; i++) {
          const transferStop = route1.stops[i].name;
          if (transferStop === destinationStop) continue;

          routes.forEach((route2) => {
            if (route1.id === route2.id || route1.routeNumber === route2.routeNumber) return;

            const fromIdx2 = route2.stops.findIndex((s) => s.name === transferStop);
            const toIdx2 = route2.stops.findIndex((s) => s.name === destinationStop);

            if (fromIdx2 !== -1 && toIdx2 !== -1 && fromIdx2 < toIdx2) {
              const comboKey = `${route1.routeNumber}-${route2.routeNumber}-${transferStop}`;
              if (seenCombos.has(comboKey)) return;
              seenCombos.add(comboKey);

              const dist1 = Math.abs(route1.stops[i].distanceKm - route1.stops[fromIdx1].distanceKm);
              const roundedDist1 = Math.max(1, Math.round(dist1 * 10) / 10);
              const fare1 = calculateFare(route1.busType, roundedDist1);

              const dist2 = Math.abs(route2.stops[toIdx2].distanceKm - route2.stops[fromIdx2].distanceKm);
              const roundedDist2 = Math.max(1, Math.round(dist2 * 10) / 10);
              const fare2 = calculateFare(route2.busType, roundedDist2);

              const liveBus1 = liveBuses.find((b) => b.routeNumber === route1.routeNumber);
              const liveBus2 = liveBuses.find((b) => b.routeNumber === route2.routeNumber);

              const walkMins = calculateWalkingMinutes(candOrigin.distMeters);
              const estDuration = Math.round(roundedDist1 * 2.2) + 4 + Math.round(roundedDist2 * 2.2);

              results.push({
                id: `transit-${comboKey}`,
                leg1: {
                  route: route1,
                  routeNumber: route1.routeNumber,
                  routeName: route1.routeName,
                  busType: liveBus1?.busType || route1.busType,
                  fromStop: candOrigin.name,
                  toStop: transferStop,
                  distanceKm: roundedDist1,
                  fare: fare1,
                  liveBus: liveBus1,
                  etaMins: liveBus1?.etaNextStopMins ?? 8,
                  stopsCount: i - fromIdx1,
                },
                leg2: {
                  route: route2,
                  routeNumber: route2.routeNumber,
                  routeName: route2.routeName,
                  busType: liveBus2?.busType || route2.busType,
                  fromStop: transferStop,
                  toStop: destinationStop,
                  distanceKm: roundedDist2,
                  fare: fare2,
                  liveBus: liveBus2,
                  etaMins: liveBus2?.etaNextStopMins ?? 12,
                  stopsCount: toIdx2 - fromIdx2,
                },
                interchangeStop: transferStop,
                totalDistanceKm: Math.round((roundedDist1 + roundedDist2) * 10) / 10,
                totalFare: fare1 + fare2,
                totalEstDurationMins: estDuration,
                walkToOriginMeters: candOrigin.distMeters,
                walkToOriginFormatted: formatDistance(candOrigin.distMeters),
                walkToOriginMins: walkMins,
              });
            }
          });
        }
      });
    });

    const filtered = results.filter((tr) => {
      if (busClassFilter === 'ac') {
        return (
          (tr.leg1.busType === 'AC Electric' || tr.leg1.busType === 'AC Low Floor CNG') ||
          (tr.leg2.busType === 'AC Electric' || tr.leg2.busType === 'AC Low Floor CNG')
        );
      }
      if (busClassFilter === 'non-ac') {
        return tr.leg1.busType === 'Non-AC Standard' || tr.leg2.busType === 'Non-AC Standard';
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const etaA = a.leg1.etaMins ?? 999;
      const etaB = b.leg1.etaMins ?? 999;
      if (etaA !== etaB) return etaA - etaB;
      return a.totalEstDurationMins - b.totalEstDurationMins;
    });
  }, [routes, destinationStop, candidateOrigins, liveBuses, calculateFare, busClassFilter]);

  // Handle bus selection for booking
  const handleSelectBusToBook = (busItem: ConnectingBusItem) => {
    setSelectedTransitRoute(null);
    setSelectedBus(busItem);
    setAdultCount(1);
    setChildCount(0);
    setIsPinkTicket(false);
    setShowBookingModal(true);
  };

  // Handle 2-bus connecting transit selection for booking
  const handleSelectTransitToBook = (transit: ConnectingTransitRoute) => {
    setSelectedBus(null);
    setSelectedTransitRoute(transit);
    setAdultCount(1);
    setChildCount(0);
    setIsPinkTicket(false);
    setShowBookingModal(true);
  };

  // Handle booking leg 1 only of connecting route
  const handleSelectTransitLeg1ToBook = (transit: ConnectingTransitRoute) => {
    setSelectedTransitRoute(null);
    setSelectedBus({
      id: `${transit.leg1.routeNumber}-${transit.leg1.fromStop}-${transit.interchangeStop}`,
      route: transit.leg1.route,
      routeNumber: transit.leg1.routeNumber,
      routeName: transit.leg1.routeName,
      busType: transit.leg1.busType,
      distanceKm: transit.leg1.distanceKm,
      fare: transit.leg1.fare,
      fromStop: transit.leg1.fromStop,
      toStop: transit.interchangeStop,
      distanceFromUserMeters: transit.walkToOriginMeters,
      distanceFromUserFormatted: transit.walkToOriginFormatted,
      walkingMinutesFromUser: transit.walkToOriginMins,
      liveBus: transit.leg1.liveBus,
    });
    setAdultCount(1);
    setChildCount(0);
    setIsPinkTicket(false);
    setShowBookingModal(true);
  };

  // Compute total booking amount with Adult & Child breakdown
  const { totalFare, adultFare, childFare, totalPassengers } = useMemo(() => {
    if (!selectedBus && !selectedTransitRoute) {
      return { totalFare: 0, adultFare: 0, childFare: 0, totalPassengers: 0 };
    }
    const aFare = selectedTransitRoute ? selectedTransitRoute.totalFare : (selectedBus?.fare ?? 0);
    const cFare = Math.max(5, Math.floor(aFare / 2));
    if (isPinkTicket) return { totalFare: 0, adultFare: 0, childFare: 0, totalPassengers: 1 };
    const total = (adultCount * aFare) + (childCount * cFare);
    return {
      totalFare: total,
      adultFare: aFare,
      childFare: cFare,
      totalPassengers: adultCount + childCount,
    };
  }, [selectedBus, selectedTransitRoute, adultCount, childCount, isPinkTicket]);

  // Initiate booking: if Pink Pass -> instant, if UPI -> open UPI payment flow
  const handleInitiateBooking = () => {
    if (!selectedBus && !selectedTransitRoute) return;

    if (isPinkTicket) {
      const routeNum = selectedTransitRoute
        ? `${selectedTransitRoute.leg1.routeNumber} ➔ ${selectedTransitRoute.leg2.routeNumber}`
        : selectedBus!.routeNumber;
      issuePinkPass(routeNum);
      toast.success('Zero-Fare Pink Ticket generated successfully!');
      setShowBookingModal(false);
      router.push('/passenger/tickets');
      return;
    }

    if (totalPassengers <= 0) {
      toast.error('Please select at least 1 passenger.');
      return;
    }

    // Launch UPI payment checkout sheet
    setUpiPin('');
    setUpiStep('PIN');
    setShowUpiModal(true);
  };

  // Execute UPI payment step with realistic authorization & feedback
  const handleExecuteUpiPayment = (pinToUse?: string) => {
    const finalPin = pinToUse ?? upiPin;
    if (finalPin.length < 4) {
      toast.error('Please enter your 4-digit UPI PIN');
      return;
    }

    setUpiStep('PROCESSING');

    // Simulate 1.4s authentic UPI network & NPCI processing
    setTimeout(() => {
      setUpiStep('SUCCESS');

      setTimeout(() => {
        executeFinalBooking();
      }, 1000);
    }, 1400);
  };

  // Finalize booking after verified UPI payment
  const executeFinalBooking = () => {
    const activeApp = UPI_APP_OPTIONS.find((a) => a.id === selectedUpiApp);
    const appLabel = activeApp ? activeApp.name : 'UPI';

    if (selectedPassBooking) {
      const pass = issueDtcPass({
        passType: selectedPassBooking.passType,
        cost: selectedPassBooking.cost,
        paymentMode: `UPI (${appLabel})`,
      });
      toast.success(
        `₹${selectedPassBooking.cost.toFixed(2)} paid via ${appLabel}! ${selectedPassBooking.passType} Pass generated for today.`
      );
      setShowUpiModal(false);
      setSelectedPassBooking(null);
      router.push('/passenger/tickets?tab=passes');
      return;
    }

    if (selectedTransitRoute) {
      const ticket = bookPassengerTicket({
        origin: selectedTransitRoute.leg1.fromStop,
        destination: selectedTransitRoute.leg2.toStop,
        routeNumber: `${selectedTransitRoute.leg1.routeNumber} ➔ ${selectedTransitRoute.leg2.routeNumber}`,
        busType: selectedTransitRoute.leg1.busType,
        passengersCount: totalPassengers,
        adultCount: isPinkTicket ? 1 : adultCount,
        childCount: isPinkTicket ? 0 : childCount,
        adultFare,
        childFare,
        fare: adultFare,
        totalAmount: totalFare,
        paymentMode: `UPI (${appLabel})`,
        isConnecting: true,
        transferStop: selectedTransitRoute.interchangeStop,
        connectingLegs: {
          leg1Route: selectedTransitRoute.leg1.routeNumber,
          leg1From: selectedTransitRoute.leg1.fromStop,
          leg1To: selectedTransitRoute.interchangeStop,
          leg2Route: selectedTransitRoute.leg2.routeNumber,
          leg2From: selectedTransitRoute.interchangeStop,
          leg2To: selectedTransitRoute.leg2.toStop,
        },
      });

      toast.success(
        `₹${totalFare.toFixed(2)} paid via ${appLabel}! Connecting Ticket #${ticket.ticketNumber} generated.`
      );
      setShowUpiModal(false);
      setShowBookingModal(false);
      router.push('/passenger/tickets');
      return;
    }

    if (selectedBus) {
      const ticket = bookPassengerTicket({
        origin: selectedBus.fromStop,
        destination: selectedBus.toStop,
        routeNumber: selectedBus.routeNumber,
        busType: selectedBus.busType,
        passengersCount: totalPassengers,
        adultCount: isPinkTicket ? 1 : adultCount,
        childCount: isPinkTicket ? 0 : childCount,
        adultFare,
        childFare,
        fare: adultFare,
        totalAmount: totalFare,
        paymentMode: `UPI (${appLabel})`,
      });

      toast.success(
        totalPassengers > 1
          ? `₹${totalFare.toFixed(2)} paid via ${appLabel}! Booked for ${totalPassengers} commuters.`
          : `₹${totalFare.toFixed(2)} paid via ${appLabel}! Ticket #${ticket.ticketNumber} generated!`
      );
      setShowUpiModal(false);
      setShowBookingModal(false);
      router.push('/passenger/tickets');
    }
  };

  const handleQuickPinkPass = () => {
    issuePinkPass('All Delhi Routes');
    toast.success('Free Pink Ticket issued for today! Check My Tickets.');
    router.push('/passenger/tickets');
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200">
      {/* 1. CLEAN MODERN HEADER */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">
            👋 Welcome back
          </span>
          <h2 className="text-base font-black text-foreground tracking-tight">
            {passengerProfile.name}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Clickable GPS Location pill */}
          <button
            onClick={() => setShowLocationPicker(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted border border-border/80 text-[10px] font-semibold text-foreground transition-all shadow-2xs"
            title="Change Location"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[100px]">{userLocation.label.split('/')[0]}</span>
          </button>

          {/* Quick My Tickets Link */}
          <Link
            href="/passenger/tickets"
            className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:bg-emerald-500/20 transition-all"
          >
            <QrCode className="size-3" />
            <span>My Tickets</span>
          </Link>
        </div>
      </div>

      {/* 2. ACTIVE TICKET (IF ANY) - Compact Pill Banner */}
      {activeTicket && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-sm flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <QrCode className="size-4 shrink-0 text-white" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold opacity-80 block">Active Ticket • Route {activeTicket.routeNumber}</span>
              <p className="text-xs font-black truncate">
                {activeTicket.sourceStop || activeTicket.boardingStop} ➔ {activeTicket.destinationStop}
              </p>
            </div>
          </div>
          <Link href="/passenger/tickets">
            <Button size="sm" className="bg-white hover:bg-slate-100 text-emerald-900 font-black text-[11px] rounded-xl h-7 px-2.5">
              Show QR
            </Button>
          </Link>
        </div>
      )}

      {/* 2B. DTC DAILY BUS PASS QUICK PURCHASE */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
              🎫
            </div>
            <div>
              <span className="text-xs font-black text-foreground block leading-tight">
                DTC Daily Bus Pass
              </span>
              <span className="text-[10px] text-muted-foreground">
                Unlimited rides on all Delhi routes today
              </span>
            </div>
          </div>
          <Link
            href="/passenger/tickets?tab=passes"
            className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            My Passes
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => handleInitiatePassBooking('Daily Non-AC', 40)}
            className="p-2.5 rounded-xl bg-card hover:bg-muted/80 border border-border flex items-center justify-between text-left transition-all active:scale-98 shadow-2xs group"
          >
            <div>
              <span className="text-[10px] font-bold text-muted-foreground block">Non-AC & Cluster</span>
              <span className="text-xs font-black text-foreground">
                ₹40 <span className="text-[9px] font-normal text-muted-foreground">/ Day</span>
              </span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 dark:text-emerald-300 transition-colors">
              Buy Pass
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleInitiatePassBooking('Daily AC', 50)}
            className="p-2.5 rounded-xl bg-card hover:bg-muted/80 border border-emerald-500/40 flex items-center justify-between text-left transition-all active:scale-98 shadow-2xs group"
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">AC Electric + All</span>
              <span className="text-xs font-black text-foreground">
                ₹50 <span className="text-[9px] font-normal text-muted-foreground">/ Day</span>
              </span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-600 text-white shadow-2xs">
              Buy Pass
            </span>
          </button>
        </div>
      </div>

      {/* 2. UNIFIED STREAMLINED ROUTE SEARCH CARD */}
      <div id="route-discovery-card" className="border border-border/80 shadow-xs rounded-2xl p-4 space-y-3 bg-card">
        {/* Connected Inputs Row */}
        <div className="relative space-y-2.5">
          {/* Vertical connecting line */}
          <div className="absolute left-[19px] top-[22px] bottom-[22px] w-0.5 bg-border pointer-events-none" />

          {/* From Input */}
          <div ref={fromRef} className="relative">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 size-3 rounded-full bg-emerald-600 ring-4 ring-emerald-500/20 shrink-0 z-10" />
              <input
                type="text"
                value={fromSearchQuery}
                onChange={(e) => {
                  setFromSearchQuery(e.target.value);
                  setIsFromFocused(true);
                }}
                onFocus={() => {
                  setIsFromFocused(true);
                  setIsToFocused(false);
                }}
                placeholder="From: Boarding stop (e.g. Saket, INA)..."
                className="w-full h-12 pl-10 pr-10 rounded-xl border border-input bg-background text-sm font-bold text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
              />
              {fromSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setFromSearchQuery('');
                    setOriginStop('');
                    setIsFromFocused(true);
                  }}
                  className="absolute right-3 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* From Dropdown */}
            {isFromFocused && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-card border border-border rounded-xl shadow-xl p-1.5 space-y-1">
                <button
                  type="button"
                  onClick={() => handleSelectOriginStop('ALL_NEARBY')}
                  className={`w-full p-2.5 rounded-lg text-left text-xs font-bold transition-colors flex items-center justify-between ${
                    originStop === 'ALL_NEARBY' ? 'bg-emerald-700 text-white' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500 shrink-0" />
                    <span>✨ All Nearest Stops (Auto-Discover)</span>
                  </div>
                </button>

                {filteredFromStops.map((stop) => {
                  const isNearby = nearestStops.find((n) => n.name === stop);
                  const isSelected = originStop === stop;
                  return (
                    <button
                      key={`from-opt-${stop}`}
                      type="button"
                      onClick={() => handleSelectOriginStop(stop)}
                      className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span className="font-bold">{stop}</span>
                      {isNearby && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
                          📍 {isNearby.distanceFormatted}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Swap Button on side */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <button
              type="button"
              onClick={handleSwapStops}
              className="size-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground shadow-2xs hover:scale-105 transition-all"
              title="Swap From and To"
            >
              <ArrowUpDown className="size-4 text-foreground" />
            </button>
          </div>

          {/* To Input */}
          <div ref={toRef} className="relative">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 size-3 rounded-full bg-rose-600 ring-4 ring-rose-500/20 shrink-0 z-10" />
              <input
                type="text"
                value={toSearchQuery}
                onChange={(e) => {
                  setToSearchQuery(e.target.value);
                  setIsToFocused(true);
                }}
                onFocus={() => {
                  setIsToFocused(true);
                  setIsFromFocused(false);
                }}
                placeholder="To: Where are you heading?"
                className="w-full h-12 pl-10 pr-10 rounded-xl border border-input bg-background text-sm font-bold text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-rose-600 transition-all"
              />
              {toSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setToSearchQuery('');
                    setDestinationStop('');
                    setIsToFocused(true);
                  }}
                  className="absolute right-3 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* To Dropdown */}
            {isToFocused && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-card border border-border rounded-xl shadow-xl p-1.5 space-y-1">
                {filteredToStops.map((stop) => {
                  const isSelected = destinationStop === stop;
                  return (
                    <button
                      key={`to-opt-${stop}`}
                      type="button"
                      onClick={() => handleSelectDestinationStop(stop)}
                      className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-rose-600 text-white font-bold' : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span className="font-bold">{stop}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. AVAILABLE BUSES SECTION (CLEARLY SEPARATED) */}
      <div className="pt-3 mt-1 border-t border-border/80 space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bus className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Available Buses
              </h3>
              <span className="text-[10px] text-muted-foreground font-semibold">
                {connectingBuses.length > 0
                  ? `${connectingBuses.length} ${connectingBuses.length === 1 ? 'direct bus' : 'direct buses'}`
                  : connectingTransitRoutes.length > 0
                  ? `${connectingTransitRoutes.length} connecting route${connectingTransitRoutes.length > 1 ? 's' : ''} (2 buses)`
                  : '0 buses found'}
              </span>
            </div>
          </div>

          {/* AC / Non-AC Category Filters */}
          <div className="flex items-center gap-1 bg-muted/80 p-0.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setBusClassFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                busClassFilter === 'all'
                  ? 'bg-card text-foreground shadow-2xs font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setBusClassFilter('ac')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                busClassFilter === 'ac'
                  ? 'bg-card text-emerald-700 dark:text-emerald-400 shadow-2xs font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              AC
            </button>
            <button
              type="button"
              onClick={() => setBusClassFilter('non-ac')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                busClassFilter === 'non-ac'
                  ? 'bg-card text-foreground shadow-2xs font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Non-AC
            </button>
          </div>
        </div>

        {/* CASE 1: NO DIRECT BUS FOUND */}
        {connectingBuses.length === 0 ? (
          connectingTransitRoutes.length > 0 ? (
            /* SHOW 2-BUS CONNECTING ROUTES WHEN NO DIRECT BUS RUNS */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                <Navigation2 className="size-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    No Direct 1-Bus Route • 2-Bus Connecting Routes ({connectingTransitRoutes.length})
                  </h4>
                  <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90">
                    A direct single bus is not available, but you can easily reach <strong>{destinationStop}</strong> using 2 buses with 1 transfer:
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {connectingTransitRoutes.map((transit) => (
                  <div
                    key={transit.id}
                    className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all space-y-3"
                  >
                    {/* Row 1: Route Badges, Transfer Pill & Total Fare */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-700 text-white font-black text-xs shadow-2xs">
                            {transit.leg1.routeNumber}
                          </span>
                          <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                          <span className="px-2.5 py-1 rounded-xl bg-blue-700 text-white font-black text-xs shadow-2xs">
                            {transit.leg2.routeNumber}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          1 Transfer
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-foreground">₹{transit.totalFare}</span>
                        <span className="text-[10px] text-muted-foreground block">total fare</span>
                      </div>
                    </div>

                    {/* Row 2: Connecting Journey Stepper */}
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-2 text-xs">
                      {/* Leg 1 */}
                      <div className="flex items-start gap-2.5">
                        <div className="size-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          1
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-xs truncate">
                              {transit.leg1.fromStop}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              ₹{transit.leg1.fare}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span>Bus <strong>{transit.leg1.routeNumber}</strong> ({transit.leg1.busType})</span>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">● In {transit.leg1.etaMins}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Interchange Point */}
                      <div className="flex items-center gap-2 pl-1.5 py-0.5">
                        <div className="w-0.5 h-3 bg-muted-foreground/30 -mt-1 ml-1" />
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          <ArrowUpDown className="size-3 text-amber-600" />
                          <span>Change Bus at {transit.interchangeStop}</span>
                        </div>
                      </div>

                      {/* Leg 2 */}
                      <div className="flex items-start gap-2.5">
                        <div className="size-5 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          2
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-xs truncate">
                              {transit.leg2.toStop}
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">
                              ₹{transit.leg2.fare}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span>Bus <strong>{transit.leg2.routeNumber}</strong> ({transit.leg2.busType})</span>
                            <span>•</span>
                            <span>~{Math.round(transit.leg2.distanceKm * 2.2)}m trip</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSelectTransitLeg1ToBook(transit)}
                        className="h-11 px-3 text-xs font-bold rounded-xl border-border"
                      >
                        <span>Leg 1 (₹{transit.leg1.fare})</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleSelectTransitToBook(transit)}
                        className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
                      >
                        <span>Book Connecting Journey (₹{transit.totalFare})</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-2">
              <AlertCircle className="size-8 text-amber-500 mx-auto" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">No Direct or Connecting Bus Found</h4>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  No direct or connecting route found to <strong className="text-foreground">{destinationStop || 'destination'}</strong> from selected stops.
                  Try searching for another stop or choosing major hubs like <strong>AIIMS</strong>, <strong>Saket</strong>, or <strong>Dhaula Kuan</strong>.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleSelectOriginStop('ALL_NEARBY');
                    handleSelectDestinationStop('Janpath / CP');
                  }}
                  className="text-xs rounded-xl"
                >
                  Reset to All Nearest Stops ➔ Janpath
                </Button>
              </div>
            </div>
          )
        ) : (
          /* CASE 2: DIRECT BUSES FOUND */
          <div className="space-y-2">
            {connectingBuses.map((bus) => {
              const isAC = bus.busType === 'AC Electric' || bus.busType === 'AC Low Floor CNG';
              const walkMins = bus.walkingMinutesFromUser;
              const busEta = bus.liveBus?.etaNextStopMins;
              const willCatchOnTime = busEta !== undefined ? busEta >= walkMins : true;
              const isExpanded = expandedBusId === bus.id;

              // Compute route stops between fromStop and toStop
              const fromIdx = bus.route.stops.findIndex((s) => s.name === bus.fromStop);
              const toIdx = bus.route.stops.findIndex((s) => s.name === bus.toStop);
              const tripStops =
                fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx
                  ? bus.route.stops.slice(fromIdx, toIdx + 1)
                  : [];

              return (
                <div
                  key={bus.id}
                  className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all space-y-3"
                >
                  {/* Row 1: Bus Route Number, AC badge, Live Arrival & Fare */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-3 py-1 rounded-xl font-black text-sm text-white shadow-2xs ${
                          isAC ? 'bg-emerald-700' : 'bg-slate-700'
                        }`}
                      >
                        {bus.routeNumber}
                      </span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">
                            {bus.busType}
                          </span>
                          {bus.liveBus?.busNumber && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.2 rounded font-semibold">
                              {bus.liveBus.busNumber}
                            </span>
                          )}
                        </div>
                        {busEta !== undefined && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            ● Arriving in {busEta} mins
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-foreground">₹{bus.fare}</span>
                      <span className="text-[10px] text-muted-foreground block">per ticket</span>
                    </div>
                  </div>

                  {/* Row 2: Boarding Stop & Destination Details */}
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/70 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block tracking-wider">
                        Boarding Stop
                      </span>
                      <span className="font-bold text-foreground text-sm truncate block">
                        {bus.fromStop}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                        {bus.distanceFromUserFormatted} (~{bus.walkingMinutesFromUser}m walk)
                      </span>
                    </div>

                    <ArrowRight className="size-4 text-muted-foreground shrink-0 mx-1" />

                    <div className="space-y-0.5 text-right min-w-0 pl-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block tracking-wider">
                        Destination
                      </span>
                      <span className="font-bold text-foreground text-sm truncate block">
                        {bus.toStop}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium block">
                        ~{Math.round(bus.distanceKm * 2.2)} mins trip
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedBusId(isExpanded ? null : bus.id)}
                      className="h-11 px-3 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl border border-border bg-muted/30 flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide' : 'Stops'}</span>
                      {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>

                    <Button
                      type="button"
                      onClick={() => handleSelectBusToBook(bus)}
                      className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Book Ticket</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  {/* Simple clean stops list if expanded */}
                  {isExpanded && tripStops.length > 0 && (
                    <div className="pt-2 border-t border-border space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Route Stops ({tripStops.length} Total)
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground">
                        {tripStops.map((st, sIdx) => (
                          <React.Fragment key={st.id || sIdx}>
                            <span className={sIdx === 0 || sIdx === tripStops.length - 1 ? 'font-black text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md' : 'bg-muted px-2 py-0.5 rounded-md text-muted-foreground'}>
                              {st.name}
                            </span>
                            {sIdx < tripStops.length - 1 && <span className="text-muted-foreground/60">➔</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHANGE MY LOCATION MODAL (When commuter is elsewhere in city) */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-8 space-y-3.5">
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
              Wherever you are located in Delhi NCR, distances to nearby bus stops are automatically calculated:
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

      {/* BOOKING MODAL WITH DOCKED FOOTER & HIGH Z-INDEX */}
      {showBookingModal && (selectedBus || selectedTransitRoute) && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            {/* Sticky Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
              <div className="flex items-center gap-2">
                {selectedTransitRoute ? (
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-700 text-white font-black text-xs shadow-2xs">
                      {selectedTransitRoute.leg1.routeNumber}
                    </span>
                    <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    <span className="px-2 py-0.5 rounded-lg bg-blue-700 text-white font-black text-xs shadow-2xs">
                      {selectedTransitRoute.leg2.routeNumber}
                    </span>
                  </div>
                ) : (
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-700 text-white font-black text-xs shadow-2xs">
                    {selectedBus?.routeNumber}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    {selectedTransitRoute ? 'Confirm 2-Bus Booking' : 'Confirm Bus Booking'}
                  </h3>
                  <span className="text-[10px] text-muted-foreground block">
                    {selectedTransitRoute
                      ? `Via ${selectedTransitRoute.interchangeStop} • ${selectedTransitRoute.totalDistanceKm} KM Total`
                      : `${selectedBus?.busType} • ${selectedBus?.distanceKm} KM Journey`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedBus(null);
                  setSelectedTransitRoute(null);
                }}
                className="size-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-3.5 space-y-3 overflow-y-auto flex-1">
              {/* COMPACT JOURNEY ROUTE HEADER */}
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/70 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
                    <span className="truncate">
                      {selectedTransitRoute ? selectedTransitRoute.leg1.fromStop : selectedBus?.fromStop}
                    </span>
                    <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {selectedTransitRoute ? selectedTransitRoute.leg2.toStop : selectedBus?.toStop}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 shrink-0">
                    ₹{adultFare}/adult
                  </span>
                </div>
                {selectedTransitRoute && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                    <ArrowUpDown className="size-2.5" />
                    <span>Transfer at {selectedTransitRoute.interchangeStop} (Bus 1: ₹{selectedTransitRoute.leg1.fare} + Bus 2: ₹{selectedTransitRoute.leg2.fare})</span>
                  </div>
                )}
                {/* Live Date & Time Row */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <svg className="size-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] font-semibold">
                      {bookingNow.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <svg className="size-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[10px] font-black text-foreground tabular-nums">
                      {bookingNow.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Passenger Selectors: Adult & Child */}
              {!isPinkTicket && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Select Passengers
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Adult Stepper */}
                    <div className="p-2.5 rounded-xl bg-background border border-border shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Adult</span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">₹{adultFare}</span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <button
                          type="button"
                          disabled={adultCount <= 0 || (adultCount === 1 && childCount === 0)}
                          onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                          className="size-7 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-bold disabled:opacity-30"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-sm font-black text-foreground font-mono">{adultCount}</span>
                        <button
                          type="button"
                          disabled={adultCount + childCount >= 6}
                          onClick={() => setAdultCount(adultCount + 1)}
                          className="size-7 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-bold disabled:opacity-30"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Child Stepper */}
                    <div className="p-2.5 rounded-xl bg-background border border-border shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Child (5-12 yr)</span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">₹{childFare}</span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <button
                          type="button"
                          disabled={childCount <= 0}
                          onClick={() => setChildCount(Math.max(0, childCount - 1))}
                          className="size-7 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-bold disabled:opacity-30"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-sm font-black text-foreground font-mono">{childCount}</span>
                        <button
                          type="button"
                          disabled={adultCount + childCount >= 6}
                          onClick={() => setChildCount(childCount + 1)}
                          className="size-7 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground font-bold disabled:opacity-30"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Women Free Pink Pass Strip */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/25">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-pink-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-pink-900 dark:text-pink-200 block">
                      Women Free Pink Pass
                    </span>
                    <span className="text-[9px] text-pink-700/80 dark:text-pink-300/80 block">
                      Zero-Fare Scheme (₹0)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsPinkTicket(!isPinkTicket);
                    if (!isPinkTicket) {
                      setAdultCount(1);
                      setChildCount(0);
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isPinkTicket
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-card border border-pink-500/40 text-pink-700 dark:text-pink-300 hover:bg-pink-500/10'
                  }`}
                >
                  {isPinkTicket ? 'Applied (₹0)' : 'Apply'}
                </button>
              </div>

              {/* SELECT UPI PAYMENT APP */}
              {!isPinkTicket && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Select UPI App For Payment
                    </label>
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                      Direct Bank Transfer
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {UPI_APP_OPTIONS.map((app) => {
                      const isSelected = selectedUpiApp === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-500/10 text-foreground font-bold ring-1 ring-emerald-600 shadow-2xs'
                              : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`size-6 rounded-lg ${app.iconBg} text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}>
                              {app.shortName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block leading-none truncate text-foreground">
                                {app.name}
                              </span>
                              <span className="text-[9px] text-muted-foreground block truncate">
                                {app.bank.split(' ••••')[0]}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="size-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <Check className="size-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* DOCKED STICKY FOOTER: CLEAN & FITS ON MOBILE SCREEN WITHOUT SCROLL */}
            <div className="p-3.5 pb-4 bg-card border-t border-border space-y-2 shrink-0 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    {isPinkTicket
                      ? 'Zero-Fare Scheme Applied'
                      : `${adultCount} Adult${adultCount > 1 ? 's' : ''}${childCount > 0 ? ` + ${childCount} Child` : ''}`}
                  </span>
                  <span className="text-lg font-black text-foreground leading-tight">
                    {isPinkTicket ? 'FREE (₹0.00)' : `₹${totalFare.toFixed(2)}`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                    {selectedTransitRoute ? totalPassengers * 2 : totalPassengers} QR Ticket{totalPassengers > 1 || selectedTransitRoute ? 's' : ''}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium">Valid for 2 Hours</span>
                </div>
              </div>

              <Button
                onClick={handleInitiateBooking}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl h-10 shadow-sm flex items-center justify-center gap-2"
              >
                <span>
                  {isPinkTicket
                    ? 'Generate Free Pink Pass'
                    : `Pay ₹${totalFare.toFixed(2)} via ${
                        UPI_APP_OPTIONS.find((a) => a.id === selectedUpiApp)?.name || 'UPI'
                      }`}
                </span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTIC UPI PAYMENT GATEWAY SHEET (GPay / Paytm / PhonePe / BHIM) */}
      {showUpiModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Header with Selected App */}
            {(() => {
              const app = UPI_APP_OPTIONS.find((a) => a.id === selectedUpiApp) || UPI_APP_OPTIONS[0];
              const displayFare = selectedPassBooking ? selectedPassBooking.cost : totalFare;

              return (
                <div className="flex flex-col max-h-full overflow-hidden">
                  {/* Brand Top Bar */}
                  <div className={`px-4 py-3 ${app.iconBg} text-white flex items-center justify-between shrink-0 shadow-xs`}>
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm shadow-2xs">
                        {app.shortName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-black tracking-tight leading-tight">{app.name}</div>
                        <div className="text-[9px] text-white/80 font-mono">NPCI UPI Gateway • Verified</div>
                      </div>
                    </div>
                    {upiStep !== 'PROCESSING' && (
                      <button
                        onClick={() => {
                          setShowUpiModal(false);
                          setSelectedPassBooking(null);
                        }}
                        className="size-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Body Content depending on step */}
                  <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1 overscroll-contain">
                    {/* STEP 1: PIN ENTRY & CONFIRMATION */}
                    {upiStep === 'PIN' && (
                      <div className="space-y-3">
                        {/* Merchant Details Box */}
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground text-[11px]">Paying To:</span>
                            <span className="font-bold text-foreground text-xs flex items-center gap-1">
                              <span>Delhi Transport Corporation</span>
                              <CheckCircle2 className="size-3.5 text-emerald-600 inline" />
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground text-[11px]">
                              {selectedPassBooking ? 'Pass Type:' : 'Journey:'}
                            </span>
                            <span className="font-semibold text-foreground text-[11px] truncate max-w-[190px]">
                              {selectedPassBooking
                                ? `${selectedPassBooking.passType} Pass (All Delhi Routes)`
                                : selectedTransitRoute
                                ? `${selectedTransitRoute.leg1.fromStop} ➔ ${selectedTransitRoute.leg2.toStop}`
                                : `${selectedBus?.fromStop} ➔ ${selectedBus?.toStop}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground text-[11px]">Commuters:</span>
                            <span className="font-semibold text-foreground text-[11px]">
                              {selectedPassBooking
                                ? '1 Passenger (Unlimited Travel Today)'
                                : `${adultCount > 0 ? `${adultCount} Adult` : ''}${childCount > 0 ? ` + ${childCount} Child` : ''}`}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-border flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">Total Payable:</span>
                            <span className="text-xl font-black text-foreground font-mono">
                              ₹{displayFare.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Debiting Account */}
                        <div className="flex items-center justify-between p-2 rounded-xl border border-border bg-card text-xs">
                          <div className="flex items-center gap-2">
                            <Building2 className="size-4 text-muted-foreground shrink-0" />
                            <div>
                              <span className="font-bold text-foreground block text-[11px] leading-tight">
                                {app.bank}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                UPI ID: {app.upiVpa}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            Linked
                          </span>
                        </div>

                        {/* Switch App quick row */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground font-semibold block">
                            Switch UPI App:
                          </span>
                          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            {UPI_APP_OPTIONS.map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => setSelectedUpiApp(a.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all shrink-0 ${
                                  selectedUpiApp === a.id
                                    ? 'bg-foreground text-background border-foreground font-black'
                                    : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
                                }`}
                              >
                                {a.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* UPI PIN entry simulation */}
                        <div className="p-2.5 rounded-2xl bg-muted/20 border border-border space-y-1.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <Lock className="size-3 text-emerald-600" />
                            <span>Enter 4-Digit UPI PIN</span>
                          </div>

                          {/* 4 Dots PIN Display */}
                          <div className="flex items-center justify-center gap-2.5 py-0.5">
                            {[0, 1, 2, 3].map((idx) => (
                              <div
                                key={idx}
                                className={`size-3 rounded-full border transition-all ${
                                  upiPin.length > idx
                                    ? 'bg-foreground border-foreground scale-110'
                                    : 'border-muted-foreground/40 bg-muted/50'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Quick Keypad */}
                          <div className="grid grid-cols-3 gap-1 max-w-[190px] mx-auto pt-0.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                              <button
                                key={digit}
                                type="button"
                                onClick={() => {
                                  if (upiPin.length < 4) {
                                    const next = upiPin + digit;
                                    setUpiPin(next);
                                    if (next.length === 4) {
                                      handleExecuteUpiPayment(next);
                                    }
                                  }
                                }}
                                className="h-8 rounded-lg bg-card hover:bg-muted border border-border text-xs font-black text-foreground shadow-2xs active:scale-95 transition-all"
                              >
                                {digit}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setUpiPin('')}
                              className="h-8 rounded-lg bg-muted/40 hover:bg-muted border border-border text-[9px] font-bold text-muted-foreground active:scale-95"
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (upiPin.length < 4) {
                                  const next = upiPin + '0';
                                  setUpiPin(next);
                                  if (next.length === 4) {
                                    handleExecuteUpiPayment(next);
                                  }
                                }
                              }}
                              className="h-8 rounded-lg bg-card hover:bg-muted border border-border text-xs font-black text-foreground shadow-2xs active:scale-95 transition-all"
                            >
                              0
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiPin(upiPin.slice(0, -1))}
                              className="h-8 rounded-lg bg-muted/40 hover:bg-muted border border-border text-xs font-bold text-muted-foreground active:scale-95"
                            >
                              ⌫
                            </button>
                          </div>
                        </div>

                        {/* Direct 1-Tap Authorize Button */}
                        <Button
                          onClick={() => handleExecuteUpiPayment('1234')}
                          className={`w-full ${app.iconBg} hover:opacity-90 text-white font-black text-xs rounded-xl h-10 shadow-sm flex items-center justify-center gap-2`}
                        >
                          <ShieldCheck className="size-4" />
                          <span>Authorize & Pay ₹{displayFare.toFixed(2)}</span>
                        </Button>
                      </div>
                    )}

                    {/* STEP 2: PROCESSING */}
                    {upiStep === 'PROCESSING' && (
                      <div className="py-8 text-center space-y-3">
                        <div className="size-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-foreground">
                            Processing Payment via {app.name}...
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Connecting with NPCI and bank server. Please do not press back.
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          ₹{displayFare.toFixed(2)}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {upiStep === 'SUCCESS' && (
                      <div className="py-7 text-center space-y-3 animate-in zoom-in-95 duration-200">
                        <div className="size-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                          <Check className="size-7 stroke-[3]" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-foreground">
                            Payment Successful!
                          </h4>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                            ₹{displayFare.toFixed(2)} received via {app.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono pt-1">
                            Ref: UPI/DTC/{Date.now().toString().slice(-8)} • Generating Pass/Ticket...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
