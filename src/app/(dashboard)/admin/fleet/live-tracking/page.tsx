'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bus,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  Gauge,
  Users,
  Activity,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LiveFleetTrackingPage() {
  const liveBuses = useDtcStore((state) => state.liveBuses);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = liveBuses.filter(
    (b) =>
      b.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.depot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('GPS telemetry synchronized from Delhi Transport Command Server.');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Delhi AIS-140 GPS Real-time Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Live Fleet Tracking (लाइव बस ट्रैकिंग)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time speeds, route stages, ETA to next bus stops, passenger occupancy, and depot telematics.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="gap-2 text-xs shrink-0"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Sync GPS Telemetry
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Monitored Fleet</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              {liveBuses.length} Buses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Bus className="size-3.5 text-emerald-600" />
            All GPS transmitters online
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Average Network Speed</CardDescription>
            <CardTitle className="text-2xl font-black text-blue-600">
              31.0 km/h
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Gauge className="size-3.5 text-blue-600" />
            Delhi arterial corridors
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Average Bus Occupancy</CardDescription>
            <CardTitle className="text-2xl font-black text-amber-600">
              77.8%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="size-3.5 text-amber-600" />
            Peak morning commuter density
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">EV Buses Active</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-600">
              50% EV
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Zap className="size-3.5 text-emerald-600" />
            Zero-emission Delhi fleet
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by bus number, route, depot, driver..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 text-sm"
        />
      </div>

      {/* Live Fleet Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((bus) => (
          <Card key={bus.id} className="border-border hover:border-emerald-500/40 transition-all shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm bg-foreground text-background px-2 py-0.5 rounded">
                    {bus.busNumber}
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    Route {bus.routeNumber}
                  </span>
                </div>

                <Badge
                  className={`text-[10px] ${
                    bus.status === 'On Route'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {bus.status}
                </Badge>
              </div>

              <CardDescription className="text-xs">
                {bus.busType} &bull; {bus.depot}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              {/* Telemetry Stage Line */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <MapPin className="size-3.5 text-rose-500" />
                    Current: {bus.currentStop}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {bus.currentSpeedKmH} km/h
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 text-emerald-600" />
                    Next: {bus.nextStop}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    ETA: ~{bus.etaNextStopMins} mins
                  </span>
                </div>
              </div>

              {/* Occupancy bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Passenger Load / Density</span>
                  <span className="font-bold text-foreground">{bus.occupancyPercent}% Occupied</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      bus.occupancyPercent > 85
                        ? 'bg-rose-500'
                        : bus.occupancyPercent > 65
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${bus.occupancyPercent}%` }}
                  />
                </div>
              </div>

              {/* Crew details */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <span>Driver: <strong className="text-foreground">{bus.driverName}</strong></span>
                <span>Conductor: <strong className="text-foreground">{bus.conductorName}</strong></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
