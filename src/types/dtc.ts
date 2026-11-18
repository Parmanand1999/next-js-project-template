export type BusCategory = 'AC Electric' | 'AC Low Floor CNG' | 'Non-AC Standard';

export interface BusStop {
  id: string;
  name: string;
  distanceKm: number;
  stage: number;
  lat?: number;
  lng?: number;
  landmark?: string;
}

export interface NearestStopInfo {
  name: string;
  distanceMeters: number;
  distanceFormatted: string;
  walkingTimeMinutes: number;
  walkingAdvice: string;
  landmark?: string;
  lat: number;
  lng: number;
}

export interface DtcRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  busType: BusCategory;
  totalDistanceKm: number;
  stopsCount: number;
  frequencyMinutes: number;
  firstBus: string;
  lastBus: string;
  stops: BusStop[];
  status: 'Active' | 'Diverted' | 'Suspended';
}

export interface FareSlab {
  id: string;
  busCategory: BusCategory;
  minKm: number;
  maxKm: number;
  fare: number;
}

export interface NoTicketChallan {
  id: string;
  challanNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerAge?: number;
  gender: 'Male' | 'Female' | 'Other';
  busNumber: string;
  routeNumber: string;
  locationStop: string;
  conductorName: string;
  conductorBadge: string;
  penaltyAmount: number;
  fareDue: number;
  totalAmount: number;
  paymentMode: 'Cash' | 'Conductor UPI QR' | 'Pending';
  status: 'Paid on Spot' | 'Pending Payment' | 'Disputed';
  issuedAt: string;
  notes?: string;
}

export type InvalidTicketReason =
  | 'QR Code Expired'
  | 'Wrong Bus Route'
  | 'Non-AC Ticket in AC Bus'
  | 'Duplicate / Screenshot Misuse'
  | 'Over-travel (Beyond Destination)'
  | 'Tampered Physical Ticket';

export interface InvalidTicketViolation {
  id: string;
  ticketId: string;
  passengerName: string;
  reason: InvalidTicketReason;
  busNumber: string;
  routeNumber: string;
  detectedAtStop: string;
  conductorName: string;
  conductorBadge: string;
  fareDifference: number;
  penaltyAmount: number;
  actionTaken: 'Difference Fare Collected' | 'Penalty Levied' | 'Warned & Deboarded' | 'Under Review';
  status: 'Resolved' | 'Action Pending';
  timestamp: string;
}

export type NoticePriority = 'Normal' | 'High' | 'Urgent';
export type NoticeAudience = 'All' | 'Conductors & Drivers' | 'Passengers' | 'Depot Managers';

export interface DtcNotice {
  id: string;
  noticeNumber: string;
  title: string;
  content: string;
  category: 'Operations' | 'Route Diversion' | 'HR & Duty' | 'Public Advisory' | 'Maintenance';
  priority: NoticePriority;
  targetAudience: NoticeAudience;
  issuedBy: string;
  publishedAt: string;
  validUntil: string;
  isActive: boolean;
}

export interface ConductorDuty {
  id: string;
  conductorName: string;
  badgeNumber: string;
  phone: string;
  depot: string;
  busNumber: string;
  routeNumber: string;
  shift: 'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 06:00)';
  dutyStartTime: string;
  dutyEndTime?: string;
  etimMachineId: string;
  ticketsSoldDigital: number;
  ticketsSoldCash: number;
  pinkTicketsIssued: number;
  totalCashCollected: number;
  status: 'On Duty' | 'Shift Completed' | 'Handed Over' | 'On Break';
}

export interface ShiftHandover {
  id: string;
  handoverCode: string;
  fromConductor: string;
  fromBadge: string;
  toConductor: string;
  toBadge: string;
  busNumber: string;
  routeNumber: string;
  handoverStop: string;
  cashHandedOver: number;
  etimStatus: 'Healthy' | 'Battery Low' | 'Paper Roll Replaced';
  handoverTime: string;
  status: 'Accepted' | 'Discrepancy Reported';
  notes?: string;
}

export interface IndividualQrItem {
  passengerIndex: number;
  passengerLabel: string;
  passengerType: 'Adult' | 'Child' | 'Pink Pass (Free)';
  qrSerial: string;
  qrCodeData: string;
  fare: number;
  status: 'Valid' | 'Scanned & Used' | 'Expired';
}

export interface PassengerTicket {
  id: string;
  ticketNumber: string;
  passengerName?: string;
  passengerPhone: string;
  phone?: string;
  routeNumber: string;
  sourceStop: string;
  boardingStop?: string;
  destinationStop: string;
  busType: BusCategory;
  fare: number;
  passengersCount: number;
  totalAmount: number;
  bookedAt: string;
  validUntil: string;
  qrCodeData: string;
  paymentMode?: 'Wallet' | 'UPI' | 'Card' | 'Free Pink Pass' | 'Cash' | string;
  individualQrs?: IndividualQrItem[];
  status: 'Valid' | 'Scanned & Used' | 'Expired' | 'Refunded';
}

export interface DtcPass {
  id: string;
  passNumber: string;
  holderName: string;
  holderPhone: string;
  passType: 'Daily Non-AC' | 'Daily AC' | 'Monthly General' | 'Student Pass' | 'Senior Citizen' | 'Pink Pass (Free)';
  cost: number;
  issuedDate: string;
  validUntil: string;
  status: 'Active' | 'Expired' | 'Suspended';
}

export interface RefundRequest {
  id: string;
  ticketNumber: string;
  passengerName: string;
  phone: string;
  amount: number;
  reason: 'Bus Breakdown' | 'Route Diverted' | 'Wrong Ticket Booked' | 'Double Debited';
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  resolutionNotes?: string;
}

export interface LiveBus {
  id: string;
  busNumber: string;
  routeNumber: string;
  busType: BusCategory;
  depot: string;
  driverName: string;
  conductorName: string;
  currentSpeedKmH: number;
  currentStop: string;
  nextStop: string;
  etaNextStopMins: number;
  occupancyPercent: number;
  status: 'On Route' | 'Delayed' | 'At Terminal' | 'Depot Standby';
}

export type SupportCategory =
  | 'ETIM & Digital QR Failure'
  | 'Fare Dispute & Overcharging'
  | 'Bus Crew Misbehavior'
  | 'Route Delay & Missed Stop'
  | 'Lost & Found Property'
  | 'Women Safety & SOS'
  | 'Pink Pass & Concession'
  | 'General Enquiry';

export type SupportPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type SupportStatus = 'Open' | 'In Progress' | 'Escalated to Depot' | 'Resolved' | 'Closed';
export type SupportChannel =
  | 'Passenger Mobile App'
  | 'Helpline (1800-11-8181)'
  | 'WhatsApp Bot'
  | 'Web Portal'
  | 'Depot Helpdesk';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  channel: SupportChannel;
  busNumber?: string;
  routeNumber?: string;
  depot?: string;
  subject: string;
  description: string;
  assignedOfficer: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  slaStatus: 'Within SLA' | 'Near Breach' | 'SLA Breached';
}

export interface PassengerProfile {
  name: string;
  phone: string;
  email: string;
  gender: 'Female' | 'Male' | 'Other';
  walletBalance: number;
  dtcCardNumber: string;
}

