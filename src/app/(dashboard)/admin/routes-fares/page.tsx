'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Route as RouteIcon,
  Search,
  Plus,
  Calculator,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Bus,
  Sparkles,
  Zap,
  Ticket,
  ChevronRight,
  Navigation,
  Info,
} from 'lucide-react';
import { BusCategory, DtcRoute } from '@/types/dtc';
import { toast } from 'sonner';

export default function RoutesAndFaresPage() {
  const routes = useDtcStore((state) => state.routes);
  const fareSlabs = useDtcStore((state) => state.fareSlabs);
  const addRoute = useDtcStore((state) => state.addRoute);
  const calculateFare = useDtcStore((state) => state.calculateFare);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('all');

  // Calculator states
  const [calcRouteId, setCalcRouteId] = useState<string>(routes[0]?.id || '');
  const [calcSource, setCalcSource] = useState<string>('');
  const [calcDest, setCalcDest] = useState<string>('');
  const [calculatedResult, setCalculatedResult] = useState<{
    distance: number;
    fare: number;
    busType: BusCategory;
    stagesTraversed: number;
  } | null>(null);

  // New route form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRouteNum, setNewRouteNum] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newBusType, setNewBusType] = useState<BusCategory>('AC Electric');
  const [newDistance, setNewDistance] = useState('24');
  const [newFreq, setNewFreq] = useState('10');

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && r.busType.toLowerCase().includes(filterType.toLowerCase());
  });

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const calcRoute = routes.find((r) => r.id === calcRouteId) || routes[0];

  const handleCalculateFare = () => {
    if (!calcSource || !calcDest) {
      toast.error('Please select both boarding and alighting stops.');
      return;
    }
    const sourceStop = calcRoute?.stops.find((s) => s.name === calcSource);
    const destStop = calcRoute?.stops.find((s) => s.name === calcDest);

    if (!sourceStop || !destStop) {
      toast.error('Selected stops not found on this route.');
      return;
    }

    if (sourceStop.name === destStop.name) {
      toast.error('Boarding and Alighting stop cannot be the same.');
      return;
    }

    const dist = Math.abs(destStop.distanceKm - sourceStop.distanceKm);
    const stages = Math.abs(destStop.stage - sourceStop.stage) + 1;
    const fare = calculateFare(calcRoute.busType, dist);

    setCalculatedResult({
      distance: Number(dist.toFixed(1)),
      fare,
      busType: calcRoute.busType,
      stagesTraversed: stages,
    });
    toast.success(`Calculated DTC Fare: ₹${fare} for ${dist.toFixed(1)} km`);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteNum || !newRouteName || !newOrigin || !newDest) {
      toast.error('Please complete all route fields.');
      return;
    }

    addRoute({
      routeNumber: newRouteNum.toUpperCase(),
      routeName: newRouteName,
      origin: newOrigin,
      destination: newDest,
      busType: newBusType,
      totalDistanceKm: parseFloat(newDistance) || 20,
      stopsCount: 16,
      frequencyMinutes: parseInt(newFreq) || 12,
      firstBus: '05:30 AM',
      lastBus: '11:00 PM',
      status: 'Active',
      stops: [
        { id: `s-${Date.now()}-1`, name: newOrigin, distanceKm: 0, stage: 1 },
        { id: `s-${Date.now()}-2`, name: 'Midway Interchange Terminal', distanceKm: parseFloat(newDistance) / 2, stage: 3 },
        { id: `s-${Date.now()}-3`, name: newDest, distanceKm: parseFloat(newDistance), stage: 5 },
      ],
    });

    toast.success(`Route ${newRouteNum.toUpperCase()} registered in DTC Master.`);
    setShowAddModal(false);
    setNewRouteNum('');
    setNewRouteName('');
    setNewOrigin('');
    setNewDest('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 mb-2">
            <RouteIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            DTC Transit Master & Fare Regulatory System
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Routes & DTC Fare Matrix
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Delhi Government Gazette Approved Distance Stages, Tariff Rules, and Real-Time Journey Calculator.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm shrink-0"
        >
          <Plus className="size-4" />
          Add New Route
        </Button>
      </div>

      {/* Modern High-Impact Tariff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* AC / Electric Slabs */}
        <Card className="border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/5 hover:border-emerald-500/40 transition-all shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <Zap className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-foreground">
                    AC Electric & Low Floor
                  </CardTitle>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Tata Starbus EV • JBM Electric
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40">
                ₹10 - ₹25
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs pt-1">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-medium block">0 to 4 km</span>
                <span className="text-base font-black text-foreground">₹10.00</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-medium block">4.1 to 8 km</span>
                <span className="text-base font-black text-foreground">₹15.00</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-medium block">8.1 to 12 km</span>
                <span className="text-base font-black text-foreground">₹20.00</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">12+ km (Max)</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">₹25.00</span>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
              <span>Full air conditioning • Zero tailpipe emission fleet</span>
            </div>
          </CardContent>
        </Card>

        {/* Non-AC Standard Slabs */}
        <Card className="border-border/80 bg-gradient-to-br from-card via-card to-blue-500/5 hover:border-blue-500/40 transition-all shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  <Bus className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-foreground">
                    Non-AC Standard Fleet
                  </CardTitle>
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">
                    Green Standard & Regional CNG
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40">
                ₹5 - ₹15
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs pt-1">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-medium block">0 to 4 km</span>
                <span className="text-base font-black text-foreground">₹5.00</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-medium block">4.1 to 10 km</span>
                <span className="text-base font-black text-foreground">₹10.00</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold block">10+ km (Max)</span>
                <span className="text-base font-black text-blue-700 dark:text-blue-400">₹15.00</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Daily Pass (Non-AC All Routes):</span>
              <strong className="text-foreground font-bold">₹40.00 / day</strong>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-blue-600 shrink-0" />
              <span>Conductor ETIM & Mobile QR valid on all standard routes</span>
            </div>
          </CardContent>
        </Card>

        {/* Delhi Govt. Pink Ticket Scheme */}
        <Card className="border-pink-500/30 bg-gradient-to-br from-pink-50/40 via-card to-rose-50/30 dark:from-pink-950/20 dark:to-card hover:border-pink-500/60 transition-all shadow-xs rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-700 dark:text-pink-300">
                  <Sparkles className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-pink-950 dark:text-pink-200">
                    महिला सम्मान • निःशुल्क यात्रा
                  </CardTitle>
                  <span className="text-[10px] font-bold text-pink-700 dark:text-pink-400">
                    Delhi Govt. Pink Ticket Scheme
                  </span>
                </div>
              </div>
              <Badge className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-[10px] px-2 py-0.5">
                Free Pass
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs pt-1">
            <div className="p-3 rounded-xl bg-pink-100/60 dark:bg-pink-950/50 border border-pink-300/60 dark:border-pink-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-800 dark:text-pink-300 block">
                  Women Commuter Fare
                </span>
                <span className="text-xs text-pink-900/80 dark:text-pink-200">
                  All AC & Non-AC DTC routes
                </span>
              </div>
              <span className="text-2xl font-black text-pink-700 dark:text-pink-300">
                ₹0.00
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-background/80 border border-border/60">
                <span className="text-muted-foreground block text-[10px]">Daily AC Pass</span>
                <strong className="text-foreground font-bold">₹50.00 / day</strong>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border/60">
                <span className="text-muted-foreground block text-[10px]">Monthly Pass</span>
                <strong className="text-foreground font-bold">₹1,000.00</strong>
              </div>
            </div>
            <div className="text-[11px] text-pink-800 dark:text-pink-300 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-3 text-pink-600 shrink-0" />
              <span>Issued directly via Conductor ETIM & Mobile QR</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Routes Directory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-col gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search route (e.g. 502, Mudrika, 729)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs rounded-xl"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { label: 'All Corridors', value: 'all' },
                { label: '⚡ Electric EV', value: 'electric' },
                { label: 'AC Low Floor', value: 'cng' },
                { label: 'Non-AC', value: 'non-ac' },
              ].map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setFilterType(chip.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterType === chip.value
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredRoutes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <div
                  key={route.id}
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    setCalcRouteId(route.id);
                    setCalcSource('');
                    setCalcDest('');
                    setCalculatedResult(null);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-500/5 shadow-sm ring-1 ring-emerald-500/60'
                      : 'border-border bg-card hover:border-emerald-500/30 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg font-black text-xs bg-foreground text-background tracking-wide">
                        {route.routeNumber}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold ${
                          route.busType === 'AC Electric'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : route.busType === 'AC Low Floor CNG'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {route.busType}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {route.status}
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-foreground mt-2.5 line-clamp-1">
                    {route.routeName}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-2.5 border-t border-border/50">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="size-3 text-emerald-600" />
                      {route.totalDistanceKm} km • {route.stopsCount} Stops
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="size-3 text-muted-foreground" />
                      Every {route.frequencyMinutes}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Journey Stepper & Real-time Calculator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Route Detail Card with Visual Journey Stepper */}
          {activeRoute && (
            <Card className="border-border rounded-2xl overflow-hidden shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                        Corridor {activeRoute.routeNumber}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {activeRoute.origin} ⇄ {activeRoute.destination}
                      </span>
                    </div>
                    <CardDescription className="text-xs mt-0.5">
                      Timings: {activeRoute.firstBus} – {activeRoute.lastBus} • Frequency: ~{activeRoute.frequencyMinutes} Mins • Fleet: {activeRoute.busType}
                    </CardDescription>
                  </div>

                  <Badge variant="outline" className="text-xs font-bold self-start sm:self-auto border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                    {activeRoute.totalDistanceKm} Total KM
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Navigation className="size-3 text-emerald-600" />
                    Stops Sequence & Fare Stages ({activeRoute.stops.length} Key Transit Hubs)
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Click calculator below to test fare</span>
                </div>

                {/* Visual Journey Stepper */}
                <div className="space-y-1.5 border rounded-xl p-3 bg-muted/10 max-h-[220px] overflow-y-auto">
                  {activeRoute.stops.map((stop, idx) => {
                    const isOrigin = idx === 0;
                    const isDest = idx === activeRoute.stops.length - 1;
                    return (
                      <div
                        key={stop.id}
                        className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg hover:bg-background transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`size-6 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 ${
                              isOrigin
                                ? 'bg-emerald-600 text-white'
                                : isDest
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className={`font-semibold ${isOrigin || isDest ? 'text-foreground font-bold' : 'text-foreground/90'}`}>
                            {stop.name}
                            {isOrigin ? ' (Origin Terminal)' : isDest ? ' (Destination Terminal)' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="font-mono text-[11px]">{stop.distanceKm} km</span>
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            Stage {stop.stage}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interactive Fare Calculation Engine */}
          <Card className="border-border rounded-2xl overflow-hidden shadow-xs bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                  <Calculator className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-foreground">
                    Interactive Transit Fare Engine
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Simulates Conductor ETIM & Passenger App dynamic fare generation between any two stops.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Boarding Stop (Source)
                  </label>
                  <select
                    value={calcSource}
                    onChange={(e) => setCalcSource(e.target.value)}
                    className="w-full h-10 text-xs px-3 rounded-xl border border-border bg-background text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="">-- Choose Boarding Stop --</option>
                    {calcRoute?.stops.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.distanceKm} km)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span className="size-2 rounded-full bg-rose-500" />
                    Alighting Stop (Destination)
                  </label>
                  <select
                    value={calcDest}
                    onChange={(e) => setCalcDest(e.target.value)}
                    className="w-full h-10 text-xs px-3 rounded-xl border border-border bg-background text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="">-- Choose Alighting Stop --</option>
                    {calcRoute?.stops.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.distanceKm} km)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleCalculateFare}
                className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-10 rounded-xl shadow-xs"
              >
                <Calculator className="size-4" />
                Compute Standard DTC Tariff
              </Button>

              {/* Calculated Result Card */}
              {calculatedResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Journey Distance: {calculatedResult.distance} KM
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-background font-bold text-emerald-800 dark:text-emerald-300">
                        {calculatedResult.stagesTraversed} Fare Stages
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Fleet: <strong className="text-foreground">{calculatedResult.busType}</strong> &bull; ETIM Auto-Code: Valid
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex items-center sm:flex-col justify-between sm:justify-center">
                    <div>
                      <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                        ₹{calculatedResult.fare}.00
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">/ passenger</span>
                    </div>
                    <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-950 px-2 py-0.5 rounded-md">
                      Pink Pass: ₹0.00 (Free)
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <h3 className="text-base font-bold text-foreground">Register New DTC Route</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Route Number</label>
                <Input
                  placeholder="e.g. 505 or TMS"
                  value={newRouteNum}
                  onChange={(e) => setNewRouteNum(e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Route Display Name</label>
                <Input
                  placeholder="e.g. Mehrauli to New Delhi Rly Station"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Origin Stop</label>
                  <Input
                    placeholder="Origin terminal"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Destination Stop</label>
                  <Input
                    placeholder="Destination terminal"
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Bus Fleet Category</label>
                  <select
                    value={newBusType}
                    onChange={(e) => setNewBusType(e.target.value as BusCategory)}
                    className="mt-1 w-full h-9 text-xs px-2 rounded-xl border border-border bg-background"
                  >
                    <option value="AC Electric">AC Electric</option>
                    <option value="AC Low Floor CNG">AC Low Floor CNG</option>
                    <option value="Non-AC Standard">Non-AC Standard</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-foreground">Total Distance (km)</label>
                  <Input
                    type="number"
                    value={newDistance}
                    onChange={(e) => setNewDistance(e.target.value)}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Save Route
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
