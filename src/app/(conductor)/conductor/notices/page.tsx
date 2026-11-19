'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Bell,
  BellRing,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Clock,
  ShieldAlert,
  Search,
} from 'lucide-react';

export default function ConductorNoticesPage() {
  const notices = useDtcStore((state) => state.notices);
  const activeDutyId = useDtcStore((state) => state.activeDutyId);
  const conductorDuties = useDtcStore((state) => state.conductorDuties);
  const activeDuty = conductorDuties.find((d) => d.id === activeDutyId) || conductorDuties[0];

  // Conductor specific notices
  const conductorNotices = notices.filter(
    (n) => n.isActive && (n.targetAudience === 'Conductors & Drivers' || n.targetAudience === 'All')
  );

  const [filterPriority, setFilterPriority] = useState<'All' | 'Urgent' | 'High' | 'Normal'>('All');
  const [readNotices, setReadNotices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredNotices = conductorNotices.filter((n) => {
    if (filterPriority !== 'All' && n.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.noticeNumber.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleMarkAsRead = (id: string, title: string) => {
    if (!readNotices.includes(id)) {
      setReadNotices((prev) => [...prev, id]);
      toast.success(`Circular acknowledged: "${title.slice(0, 32)}..."`);
    }
  };

  return (
    <div className="p-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* Header with Back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/conductor">
            <Button variant="ghost" size="icon" className="size-8 rounded-xl">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-base font-black text-foreground flex items-center gap-1.5">
              <BellRing className="size-4.5 text-amber-600" />
              <span>DTC Official Notice Board</span>
            </h2>
            <span className="text-[10px] text-muted-foreground">
              Circulars & Advisories from DTC Headquarters
            </span>
          </div>
        </div>

        <Badge className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20 text-[10px] font-mono font-bold">
          {conductorNotices.length} Notices
        </Badge>
      </div>

      {/* Priority Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {(['All', 'Urgent', 'High', 'Normal'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
              filterPriority === p
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-card text-foreground border-border hover:bg-muted'
            }`}
          >
            {p === 'All' ? 'All Circulars' : `${p} Priority`}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">
            <Bell className="size-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
            <p className="text-xs font-bold text-foreground">No active notices found</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              All circulars from DTC Traffic Operations are up to date.
            </p>
          </Card>
        ) : (
          filteredNotices.map((notice) => {
            const isRead = readNotices.includes(notice.id);
            const isUrgent = notice.priority === 'Urgent';
            const isHigh = notice.priority === 'High';

            return (
              <Card
                key={notice.id}
                className={`p-3.5 space-y-2.5 border transition-all shadow-xs rounded-2xl ${
                  isRead
                    ? 'opacity-85 bg-card/60 border-border/60'
                    : isUrgent
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : isHigh
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-border bg-card'
                }`}
              >
                {/* Notice Top Bar */}
                <div className="flex items-start justify-between gap-2">
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
                      {notice.priority}
                    </Badge>
                    <Badge variant="outline" className="text-[8px] font-mono">
                      {notice.category}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {notice.noticeNumber}
                    </span>
                  </div>

                  {isRead ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[8px] font-bold">
                      Acknowledged ✓
                    </Badge>
                  ) : (
                    <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-black text-foreground tracking-tight leading-snug">
                    {notice.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {notice.publishedAt}
                    </span>
                    {notice.validUntil && (
                      <span>• Valid: {notice.validUntil}</span>
                    )}
                  </div>
                </div>

                {/* Notice Body */}
                <div className="p-3 rounded-xl bg-background border border-border text-xs text-foreground leading-relaxed">
                  {notice.content}
                </div>

                {/* Authority & Action */}
                <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[10px]">
                  <span className="text-muted-foreground truncate pr-2">
                    Issued By: <strong className="text-foreground">{notice.issuedBy || 'DTC Operations HQ'}</strong>
                  </span>

                  {!isRead && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleMarkAsRead(notice.id, notice.title)}
                      className="h-7 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <CheckCircle2 className="size-3" />
                      <span>Acknowledge</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
