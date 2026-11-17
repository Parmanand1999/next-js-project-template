'use client';

import React, { useState, useMemo } from 'react';
import { useDtcStore } from '@/store/useDtcStore';
import {
  SupportTicket,
  SupportCategory,
  SupportPriority,
  SupportStatus,
  SupportChannel,
} from '@/types/dtc';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Headphones,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Phone,
  Mail,
  Bus,
  Route,
  UserCheck,
  Send,
  MessageSquare,
  Sparkles,
  LifeBuoy,
  FileText,
  Building2,
  X,
  PhoneCall,
  Check,
  ArrowUpRight,
} from 'lucide-react';

const CATEGORIES: SupportCategory[] = [
  'ETIM & Digital QR Failure',
  'Fare Dispute & Overcharging',
  'Bus Crew Misbehavior',
  'Route Delay & Missed Stop',
  'Lost & Found Property',
  'Women Safety & SOS',
  'Pink Pass & Concession',
  'General Enquiry',
];

const CHANNELS: SupportChannel[] = [
  'Passenger Mobile App',
  'Helpline (1800-11-8181)',
  'WhatsApp Bot',
  'Web Portal',
  'Depot Helpdesk',
];

const PRIORITIES: SupportPriority[] = ['Urgent', 'High', 'Medium', 'Low'];

export default function CustomerSupportPage() {
  const supportTickets = useDtcStore((state) => state.supportTickets);
  const addSupportTicket = useDtcStore((state) => state.addSupportTicket);
  const updateTicketStatus = useDtcStore((state) => state.updateTicketStatus);
  const assignTicketOfficer = useDtcStore((state) => state.assignTicketOfficer);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SupportStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [officerInput, setOfficerInput] = useState('');

  // New Ticket Form State
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    category: 'ETIM & Digital QR Failure' as SupportCategory,
    priority: 'Medium' as SupportPriority,
    channel: 'Helpline (1800-11-8181)' as SupportChannel,
    busNumber: '',
    routeNumber: '',
    depot: 'Sarojini Nagar Depot',
    subject: '',
    description: '',
    assignedOfficer: 'Ramesh Chander (Helpdesk Tier 1)',
  });

  // KPI Calculations
  const totalTickets = supportTickets.length;
  const openTickets = supportTickets.filter((t) => t.status === 'Open').length;
  const inProgressTickets = supportTickets.filter((t) => t.status === 'In Progress').length;
  const escalatedTickets = supportTickets.filter((t) => t.status === 'Escalated to Depot').length;
  const resolvedTickets = supportTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
  const urgentTickets = supportTickets.filter((t) => t.priority === 'Urgent' && t.status !== 'Resolved').length;

  // Filtered List
  const filteredTickets = useMemo(() => {
    return supportTickets.filter((ticket) => {
      const matchesSearch =
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.passengerPhone.includes(searchTerm) ||
        (ticket.busNumber && ticket.busNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.routeNumber && ticket.routeNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' ? true : ticket.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' ? true : ticket.category === categoryFilter;
      const matchesPriority = priorityFilter === 'All' ? true : ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [supportTickets, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.passengerName || !formData.passengerPhone || !formData.subject || !formData.description) {
      toast.error('Please complete all mandatory passenger and incident fields.');
      return;
    }

    addSupportTicket({
      passengerName: formData.passengerName,
      passengerPhone: formData.passengerPhone,
      passengerEmail: formData.passengerEmail || undefined,
      category: formData.category,
      priority: formData.priority,
      status: 'Open',
      channel: formData.channel,
      busNumber: formData.busNumber || undefined,
      routeNumber: formData.routeNumber || undefined,
      depot: formData.depot,
      subject: formData.subject,
      description: formData.description,
      assignedOfficer: formData.assignedOfficer,
    });

    toast.success(`Grievance registered successfully! Ticket created.`);
    setShowCreateModal(false);
    setFormData({
      passengerName: '',
      passengerPhone: '',
      passengerEmail: '',
      category: 'ETIM & Digital QR Failure',
      priority: 'Medium',
      channel: 'Helpline (1800-11-8181)',
      busNumber: '',
      routeNumber: '',
      depot: 'Sarojini Nagar Depot',
      subject: '',
      description: '',
      assignedOfficer: 'Ramesh Chander (Helpdesk Tier 1)',
    });
  };

  const handleStatusChange = (status: SupportStatus) => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, status, resolutionInput);
    toast.success(`Ticket #${selectedTicket.ticketNumber} updated to ${status}`);
    setSelectedTicket({
      ...selectedTicket,
      status,
      resolutionNotes: resolutionInput || selectedTicket.resolutionNotes,
    });
    setResolutionInput('');
  };

  const handleAssignOfficer = () => {
    if (!selectedTicket || !officerInput.trim()) return;
    assignTicketOfficer(selectedTicket.id, officerInput.trim());
    toast.success(`Ticket assigned to ${officerInput.trim()}`);
    setSelectedTicket({
      ...selectedTicket,
      assignedOfficer: officerInput.trim(),
    });
    setOfficerInput('');
  };

  const handleNotifyPassenger = () => {
    if (!selectedTicket) return;
    toast.info(`Automated SMS & WhatsApp update dispatched to ${selectedTicket.passengerPhone}`);
  };

  const getPriorityBadgeClass = (priority: SupportPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-600 text-white animate-pulse';
      case 'High':
        return 'bg-amber-600 text-white';
      case 'Medium':
        return 'bg-blue-600 text-white';
      case 'Low':
        return 'bg-slate-500 text-white';
    }
  };

  const getStatusBadgeClass = (status: SupportStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'Escalated to Depot':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'Closed':
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 mb-2">
            <Headphones className="size-3.5 text-emerald-600 animate-pulse" />
            Delhi Transport Corporation • 24x7 Commuter Central Helpdesk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            Customer Support & Grievance Desk
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-700 text-white tracking-wide">
              GNCTD PORTAL
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time management of commuter complaints, ETIM ticketing failures, lost property, bus crew conduct, and emergency requests.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-muted-foreground shadow-2xs">
            <PhoneCall className="size-3.5 text-emerald-600" />
            <span className="font-semibold text-foreground">Helpline:</span>
            <span>1800-11-8181</span>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs rounded-xl font-bold text-xs"
          >
            <Plus className="size-4" />
            Log Commuter Grievance
          </Button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="border-border shadow-2xs rounded-2xl">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold text-muted-foreground">
              Total Grievances
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">
              {totalTickets}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-[11px] text-muted-foreground">
            Multi-channel inquiries logged
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5 shadow-2xs rounded-2xl">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              Open & In-Progress
            </CardDescription>
            <CardTitle className="text-2xl font-black text-blue-900 dark:text-blue-200">
              {openTickets + inProgressTickets}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-[11px] text-blue-600 dark:text-blue-400">
            {openTickets} new • {inProgressTickets} active investigation
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5 shadow-2xs rounded-2xl">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              Escalated to Depot
            </CardDescription>
            <CardTitle className="text-2xl font-black text-purple-900 dark:text-purple-200">
              {escalatedTickets}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-[11px] text-purple-600 dark:text-purple-400">
            Crew conduct & route action
          </CardContent>
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/5 shadow-2xs rounded-2xl">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Urgent & SOS Safety
            </CardDescription>
            <CardTitle className="text-2xl font-black text-rose-900 dark:text-rose-200">
              {urgentTickets}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-[11px] text-rose-600 dark:text-rose-400">
            High priority commuter cases
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-2xs rounded-2xl col-span-2 lg:col-span-1">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Resolved & Closed
            </CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
              {resolvedTickets}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-[11px] text-emerald-600 dark:text-emerald-400">
            Avg SLA resolution: 4.2 Hours
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border/60">
          {(['All', 'Open', 'In Progress', 'Escalated to Depot', 'Resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket #, commuter name, phone, bus, route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs rounded-xl h-9"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List / Table */}
      <Card className="border-border rounded-2xl shadow-2xs overflow-hidden">
        <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="size-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold">
                Commuter Tickets Feed ({filteredTickets.length})
              </CardTitle>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Updated Live via GNCTD Bus Telematics
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No support tickets found matching the selected filters.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 hover:bg-muted/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Ticket Info & Commuter Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {ticket.ticketNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-border">
                        {ticket.channel}
                      </span>
                      <Badge className={`text-[10px] px-2 py-0 font-bold ${getPriorityBadgeClass(ticket.priority)}`}>
                        {ticket.priority}
                      </Badge>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      {ticket.slaStatus && (
                        <span className={`text-[9px] font-semibold ${
                          ticket.slaStatus === 'Within SLA' ? 'text-emerald-600' : 'text-amber-600 font-bold'
                        }`}>
                          • {ticket.slaStatus}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                      {ticket.subject}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <UserCheck className="size-3 text-emerald-600" />
                        {ticket.passengerName} ({ticket.passengerPhone})
                      </span>
                      {ticket.routeNumber && (
                        <span className="flex items-center gap-1">
                          <Route className="size-3 text-blue-600" />
                          Route {ticket.routeNumber}
                        </span>
                      )}
                      {ticket.busNumber && (
                        <span className="flex items-center gap-1">
                          <Bus className="size-3 text-purple-600" />
                          Bus {ticket.busNumber}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {ticket.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setResolutionInput(ticket.resolutionNotes || '');
                      }}
                      className="text-xs font-bold rounded-xl gap-1.5 h-8 border-border"
                    >
                      <span>View & Resolve</span>
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail & Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3 border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-foreground">
                    {selectedTicket.ticketNumber}
                  </span>
                  <Badge className={`text-[10px] px-2 py-0 font-bold ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                    {selectedTicket.priority} Priority
                  </Badge>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Commuter Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/80 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Commuter Name</span>
                <span className="font-bold text-foreground">{selectedTicket.passengerName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Phone Number</span>
                <span className="font-bold text-foreground">{selectedTicket.passengerPhone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Intake Channel</span>
                <span className="font-bold text-foreground">{selectedTicket.channel}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Route / Bus</span>
                <span className="font-bold text-foreground">
                  {selectedTicket.routeNumber || 'N/A'} • {selectedTicket.busNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Responsible Depot</span>
                <span className="font-bold text-foreground">{selectedTicket.depot || 'Central Control'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Assigned Officer</span>
                <span className="font-bold text-foreground">{selectedTicket.assignedOfficer}</span>
              </div>
            </div>

            {/* Incident Narrative */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Commuter Incident Description
              </label>
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border text-xs text-foreground leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {/* Investigation & Resolution Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Official Resolution / Investigation Notes
              </label>
              <textarea
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
                placeholder="Enter actions taken, refund transaction ID, or conductor disciplinary action..."
                className="w-full min-h-[85px] p-3 text-xs rounded-xl border border-input bg-background focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Officer Reassignment */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Reassign to another officer (e.g. Depot Manager S.K. Sharma)..."
                value={officerInput}
                onChange={(e) => setOfficerInput(e.target.value)}
                className="text-xs h-8 rounded-xl"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAssignOfficer}
                disabled={!officerInput.trim()}
                className="text-xs h-8 rounded-xl font-semibold shrink-0"
              >
                Assign
              </Button>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNotifyPassenger}
                className="text-xs font-bold rounded-xl gap-1.5 text-blue-700 hover:bg-blue-50 dark:text-blue-400"
              >
                <Send className="size-3.5" />
                Notify Commuter (SMS/WhatsApp)
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('In Progress')}
                  className="text-xs rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Mark In Progress
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('Escalated to Depot')}
                  className="text-xs rounded-xl border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Escalate to Depot
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleStatusChange('Resolved')}
                  className="text-xs rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  <Check className="size-3.5 mr-1" />
                  Resolve Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Commuter Grievance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Headphones className="size-4 text-emerald-600" />
                  Register Commuter Grievance
                </h3>
                <p className="text-xs text-muted-foreground">
                  Record intake from Helpline 1800-11-8181, Mobile App, or Walk-in.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Commuter Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rahul Verma"
                    value={formData.passengerName}
                    onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                    className="text-xs rounded-xl h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Phone Number *
                  </label>
                  <Input
                    required
                    placeholder="e.g. +91 98110 12345"
                    value={formData.passengerPhone}
                    onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                    className="text-xs rounded-xl h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Channel
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as SupportChannel })}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as SupportCategory })}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as SupportPriority })}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Route # (optional)
                  </label>
                  <Input
                    placeholder="e.g. 502, 729"
                    value={formData.routeNumber}
                    onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                    className="text-xs rounded-xl h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Bus # (optional)
                  </label>
                  <Input
                    placeholder="e.g. DL 1PD 8412"
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    className="text-xs rounded-xl h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Responsible Depot
                  </label>
                  <Input
                    placeholder="e.g. Sarojini Nagar"
                    value={formData.depot}
                    onChange={(e) => setFormData({ ...formData, depot: e.target.value })}
                    className="text-xs rounded-xl h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Grievance Subject *
                </label>
                <Input
                  required
                  placeholder="Summary of the commuter issue..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="text-xs rounded-xl h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Specify stop location, transaction ID, exact incident description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
                >
                  Log Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
