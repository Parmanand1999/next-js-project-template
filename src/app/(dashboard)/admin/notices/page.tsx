'use client';

import React, { useState } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Megaphone,
  Search,
  Plus,
  Radio,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  CheckCircle2,
  Eye,
  BellRing,
} from 'lucide-react';
import { DtcNotice, NoticeAudience, NoticePriority } from '@/types/dtc';
import { toast } from 'sonner';

export default function NoticesBoardPage() {
  const notices = useDtcStore((state) => state.notices);
  const addNotice = useDtcStore((state) => state.addNotice);
  const toggleActive = useDtcStore((state) => state.toggleNoticeActive);
  const deleteNotice = useDtcStore((state) => state.deleteNotice);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // New notice form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<DtcNotice['category']>('Operations');
  const [priority, setPriority] = useState<NoticePriority>('High');
  const [audience, setAudience] = useState<NoticeAudience>('All');
  const [issuedBy, setIssuedBy] = useState('Chief Operations Manager, DTC');
  const [validUntil, setValidUntil] = useState('30-Nov-2026');

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.noticeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.issuedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAudience = selectedAudience === 'All' || n.targetAudience === selectedAudience || n.targetAudience === 'All';
    const matchesPriority = selectedPriority === 'All' || n.priority === selectedPriority;

    return matchesSearch && matchesAudience && matchesPriority;
  });

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Title and Circular Content are required.');
      return;
    }

    addNotice({
      title,
      content,
      category,
      priority,
      targetAudience: audience,
      issuedBy,
      validUntil,
      isActive: true,
    });

    toast.success('Official DTC Notice / Circular broadcasted successfully!');
    setShowPublishModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <Radio className="size-3.5 animate-pulse" />
            Delhi Transport Corporation Official Notices & Circulars
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Central Notices Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Broadcast operational directives, route diversions, conductor shift instructions, and passenger advisories.
          </p>
        </div>

        <Button
          onClick={() => setShowPublishModal(true)}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shrink-0"
        >
          <Plus className="size-4" />
          Publish New Circular
        </Button>
      </div>

      {/* Target Audience Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { label: 'All Circulars', value: 'All', icon: Megaphone },
          { label: 'Conductors & Drivers', value: 'Conductors & Drivers', icon: Users },
          { label: 'Passengers App', value: 'Passengers', icon: BellRing },
          { label: 'Depot Managers', value: 'Depot Managers', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedAudience === tab.value;
          return (
            <Button
              key={tab.value}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedAudience(tab.value)}
              className={`text-xs gap-2 ${
                isActive ? 'bg-emerald-700 text-white' : 'text-muted-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search notices by title, circular number, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Priority:</span>
          {['All', 'Urgent', 'High', 'Normal'].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={selectedPriority === p ? 'default' : 'outline'}
              onClick={() => setSelectedPriority(p)}
              className="text-xs h-8 px-2.5"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="p-12 text-center border rounded-2xl border-dashed border-border bg-card">
            <Megaphone className="size-8 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-base font-bold text-foreground">No circulars found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your filter or publish a new notice to broadcast.
            </p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              className={`border transition-all ${
                notice.priority === 'Urgent'
                  ? 'border-rose-500/40 bg-rose-50/15 dark:bg-rose-950/10'
                  : notice.priority === 'High'
                  ? 'border-amber-500/40 bg-amber-50/15 dark:bg-amber-950/10'
                  : 'border-border bg-card'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {notice.noticeNumber}
                    </span>
                    <Badge
                      className={`text-[10px] ${
                        notice.priority === 'Urgent'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : notice.priority === 'High'
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {notice.priority} Priority
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {notice.category}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-muted text-foreground">
                      Target: {notice.targetAudience}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {notice.publishedAt}
                    </span>
                  </div>
                </div>

                <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-2">
                  {notice.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/50 p-3.5 rounded-xl border border-border/40 whitespace-pre-line">
                  {notice.content}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Issued By:</span>
                    <span>{notice.issuedBy}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Valid until: {notice.validUntil}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        toggleActive(notice.id);
                        toast.info(
                          notice.isActive
                            ? 'Notice archived / deactivated.'
                            : 'Notice re-activated.'
                        );
                      }}
                      className="text-xs h-7 text-muted-foreground hover:text-foreground"
                    >
                      {notice.isActive ? 'Active (Click to Archive)' : 'Archived'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        deleteNotice(notice.id);
                        toast.success('Notice removed from board.');
                      }}
                      className="text-xs h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Publish Notice Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Megaphone className="size-4 text-emerald-600" />
                  Publish Official DTC Circular
                </h3>
                <p className="text-xs text-muted-foreground">
                  Instantly broadcasts to Conductors, Drivers, or Passenger Mobile App.
                </p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Notice Title</label>
                <Input
                  placeholder="e.g. Route Diversion / Special Holiday Fleet Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DtcNotice['category'])}
                    className="mt-1 w-full h-9 text-xs px-2 rounded-lg border border-border bg-background"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Route Diversion">Route Diversion</option>
                    <option value="HR & Duty">HR & Duty</option>
                    <option value="Public Advisory">Public Advisory</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NoticePriority)}
                    className="mt-1 w-full h-9 text-xs px-2 rounded-lg border border-border bg-background"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as NoticeAudience)}
                    className="mt-1 w-full h-9 text-xs px-2 rounded-lg border border-border bg-background"
                  >
                    <option value="All">All Network</option>
                    <option value="Conductors & Drivers">Conductors & Drivers</option>
                    <option value="Passengers">Passengers (Mobile App)</option>
                    <option value="Depot Managers">Depot Managers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Circular Content</label>
                <textarea
                  rows={4}
                  placeholder="Enter full directive / advisory text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 w-full text-xs p-3 rounded-lg border border-border bg-background text-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Issuing Authority</label>
                  <Input
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Valid Until</label>
                  <Input
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPublishModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Broadcast Circular
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
