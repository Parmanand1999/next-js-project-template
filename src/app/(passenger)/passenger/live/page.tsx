'use client';

import React, { useState, useMemo } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { LiveBus } from '@/types/dtc';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Bus,
  Search,
  Navigation,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Radio,
  X,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function PassengerLiveBusPage() {
  const liveBuses = useDtcStore((state) => state.liveBuses);
  const routes = useDtcStore((state) => state.routes);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('All');
  const [activeBusModal, setActiveBusModal] = useState<LiveBus | null>(null);

  const filteredBuses = useMemo(() => {
    return liveBuses.filter((bus) => {
      const matchesSearch =
        bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.currentStop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.nextStop.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRoute =
        selectedRouteFilter === 'All' ? true : bus.routeNumber.toLowerCase().includes(selectedRouteFilter.toLowerCase());

      return matchesSearch && matchesRoute;
    });
  }, [liveBuses, searchTerm, selectedRouteFilter]);

  const activeRouteDetails = useMemo(() => {
    if (!activeBusModal) return null;
    return routes.find((r) => r.routeNumber === activeBusModal.routeNumber) || routes[0];
  }, [activeBusModal, routes]);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Delhi AIS-140 GPS Telemetry</span>
        </div>
        <h2 className="text-lg font-black text-foreground tracking-tight">
          Live Bus Tracking & ETAs
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Real-time bus arrival times, current speeds, and seat occupancy
        </p>
      </div>

      {/* Search & Quick Route Chips */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search bus #, route, or stop (e.g. 502, AIIMS)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs rounded-xl h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['All', '502', '729', 'TMS', '615', '419'].map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setSelectedRouteFilter(rt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedRouteFilter === rt
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted'
              }`}
            >
              {rt === 'All' ? 'All Routes' : `Route ${rt}`}
            </button>
          ))}
        </div>
      </div>

      {/* Live Buses Feed */}
      <div className="space-y-2.5">
        {filteredBuses.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground bg-card border border-border rounded-2xl p-4">
            No live buses found matching your search.
          </div>
        ) : (
          filteredBuses.map((bus) => (
            <div
              key={bus.id}
              onClick={() => setActiveBusModal(bus)}
              className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-emerald-500/60 shadow-2xs transition-all space-y-2.5 cursor-pointer"
            >
              {/* Bus Card Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                    {bus.routeNumber}
                  </div>
                  <div>
                    <span className="text-xs font-black text-foreground block">
                      {bus.busNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {bus.busType}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px]">
                    <Clock className="size-3" />
                    <span>{bus.etaNextStopMins} mins ETA</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {bus.currentSpeedKmH} km/h • Live
                  </span>
                </div>
              </div>

              {/* Stops Stepper Preview */}
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">Current Stop</span>
                  <span className="font-bold text-foreground truncate block">{bus.currentStop}</span>
                </div>
                <ArrowRight className="size-4 text-emerald-600 shrink-0 mx-2" />
                <div className="min-w-0 flex-1 text-right">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">Next Stop</span>
                  <span className="font-bold text-foreground truncate block">{bus.nextStop}</span>
                </div>
              </div>

              {/* Occupancy Indicator Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    Passenger Occupancy
                  </span>
                  <span>{bus.occupancyPercent}% (Seats Available)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      bus.occupancyPercent > 85
                        ? 'bg-rose-500'
                        : bus.occupancyPercent > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${bus.occupancyPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bus Route Journey Detail Modal */}
      {activeBusModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2.5 border-border">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Route Corridor Telematics
                </span>
                <h3 className="text-sm font-black text-foreground">
                  Bus {activeBusModal.busNumber} • Route {activeBusModal.routeNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveBusModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Crew Info */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border text-xs">
              <div>
                <span className="text-muted-foreground text-[10px] block font-semibold">Driver</span>
                <span className="font-bold text-foreground">{activeBusModal.driverName}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block font-semibold">Conductor</span>
                <span className="font-bold text-foreground">{activeBusModal.conductorName}</span>
              </div>
            </div>

            {/* Route Stops Sequence */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Upcoming Stop Timeline
              </label>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                {activeRouteDetails?.stops.map((stop, idx) => (
                  <div key={stop.id} className="flex items-start gap-2.5 text-xs">
                    <div className="flex flex-col items-center mt-0.5">
                      <span className={`size-3 rounded-full border-2 ${
                        stop.name === activeBusModal.currentStop
                          ? 'bg-emerald-500 border-white ring-2 ring-emerald-500'
                          : idx < 4
                          ? 'bg-muted-foreground/30 border-transparent'
                          : 'bg-emerald-500 border-white'
                      }`} />
                      {idx !== (activeRouteDetails.stops.length - 1) && (
                        <div className="w-0.5 h-6 bg-border my-0.5" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`font-semibold ${
                        stop.name === activeBusModal.currentStop
                          ? 'text-emerald-700 dark:text-emerald-300 font-black'
                          : 'text-foreground'
                      }`}>
                        {stop.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {stop.distanceKm} km
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setActiveBusModal(null)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9"
            >
              Close Bus Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
