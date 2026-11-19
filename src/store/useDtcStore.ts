import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DtcRoute,
  FareSlab,
  NoTicketChallan,
  InvalidTicketViolation,
  DtcNotice,
  ConductorDuty,
  ConductorAttendance,
  ShiftHandover,
  PassengerTicket,
  IndividualQrItem,
  DtcPass,
  RefundRequest,
  LiveBus,
  BusCategory,
  SupportTicket,
  SupportStatus,
  SupportCategory,
  SupportPriority,
  SupportChannel,
  PassengerProfile,
} from '@/types/dtc';

interface DtcState {
  routes: DtcRoute[];
  fareSlabs: FareSlab[];
  noTicketChallans: NoTicketChallan[];
  invalidTicketViolations: InvalidTicketViolation[];
  notices: DtcNotice[];
  conductorDuties: ConductorDuty[];
  conductorAttendances: ConductorAttendance[];
  shiftHandovers: ShiftHandover[];
  passengerTickets: PassengerTicket[];
  passes: DtcPass[];
  refundRequests: RefundRequest[];
  liveBuses: LiveBus[];
  supportTickets: SupportTicket[];
  passengerProfile: PassengerProfile;

  // Actions
  addNoTicketChallan: (challan: Omit<NoTicketChallan, 'id' | 'challanNumber' | 'issuedAt'>) => void;
  updateChallanStatus: (id: string, status: NoTicketChallan['status'], paymentMode?: NoTicketChallan['paymentMode']) => void;

  addInvalidTicketViolation: (violation: Omit<InvalidTicketViolation, 'id' | 'timestamp'>) => void;
  updateInvalidTicketAction: (id: string, actionTaken: InvalidTicketViolation['actionTaken'], status: InvalidTicketViolation['status']) => void;

  addNotice: (notice: Omit<DtcNotice, 'id' | 'noticeNumber' | 'publishedAt'>) => void;
  toggleNoticeActive: (id: string) => void;
  deleteNotice: (id: string) => void;

  addRoute: (route: Omit<DtcRoute, 'id'>) => void;
  updateRouteStatus: (id: string, status: DtcRoute['status']) => void;

  startConductorDuty: (duty: Omit<ConductorDuty, 'id' | 'dutyStartTime' | 'ticketsSoldDigital' | 'ticketsSoldCash' | 'pinkTicketsIssued' | 'totalCashCollected' | 'status'>) => void;
  punchInAttendance: (data: { dutyId: string; location?: string; shift?: string }) => void;
  endConductorDuty: (id: string, totalCashCollected: number) => void;
  recordShiftHandover: (handover: Omit<ShiftHandover, 'id' | 'handoverCode' | 'handoverTime'>) => void;

  approveRefund: (id: string, notes?: string) => void;
  rejectRefund: (id: string, notes?: string) => void;

  addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'slaStatus'>) => void;
  updateTicketStatus: (id: string, status: SupportStatus, notes?: string) => void;
  assignTicketOfficer: (id: string, officerName: string) => void;

  // Passenger Specific Actions
  bookPassengerTicket: (data: {
    origin: string;
    destination: string;
    routeNumber: string;
    busType: BusCategory;
    passengersCount: number;
    adultCount?: number;
    childCount?: number;
    adultFare?: number;
    childFare?: number;
    fare: number;
    totalAmount: number;
    paymentMode: 'Wallet' | 'UPI' | 'Card' | 'Free Pink Pass' | string;
    isConnecting?: boolean;
    transferStop?: string;
    connectingLegs?: {
      leg1Route: string;
      leg1From: string;
      leg1To: string;
      leg2Route: string;
      leg2From: string;
      leg2To: string;
    };
  }) => PassengerTicket;
  issuePinkPass: (routeNumber: string) => PassengerTicket;
  issueDtcPass: (data: {
    passType: DtcPass['passType'];
    cost: number;
    paymentMode?: string;
  }) => DtcPass;
  markTicketExpired: (ticketId: string) => void;
  markTicketUsed: (ticketId: string) => void;
  expirePass: (passId: string) => void;
  topUpWallet: (amount: number) => void;
  submitPassengerRefund: (ticketNumber: string, amount: number, reason: RefundRequest['reason']) => void;

  calculateFare: (busType: BusCategory, distanceKm: number) => number;

  // Conductor ETIM Terminal State & Actions
  activeDutyId: string;
  setActiveDutyId: (id: string) => void;
  currentStopIndex: number;
  setCurrentStopIndex: (idx: number) => void;
  advanceBusStop: () => void;
  reverseBusStop: () => void;
  verifyPassengerQr: (qrString: string) => {
    success: boolean;
    status: 'VALID' | 'ALREADY_USED' | 'INVALID_ROUTE' | 'EXPIRED' | 'NOT_FOUND';
    ticket?: PassengerTicket;
    qrItem?: IndividualQrItem;
    message: string;
    timestamp: string;
  };
  issueEtimTicket: (data: {
    origin: string;
    destination: string;
    routeNumber: string;
    busType: BusCategory;
    passengerType: 'Adult' | 'Child' | 'Pink Pass (Free)';
    count: number;
    fare: number;
  }) => PassengerTicket;
  issueConductorChallan: (data: {
    violatorName: string;
    violatorPhone: string;
    gender?: 'Male' | 'Female' | 'Other';
    violationReason: string;
    fineAmount: number;
    fareDue: number;
    paymentMode: 'Cash' | 'Conductor UPI QR' | 'Pending';
    stopName: string;
  }) => NoTicketChallan;
}

// Initial realistic DTC Routes
const initialRoutes: DtcRoute[] = [
  {
    id: 'rt-1',
    routeNumber: '502',
    routeName: 'Mehrauli Terminal ⇄ Kashmere Gate ISBT',
    origin: 'Mehrauli Terminal',
    destination: 'Kashmere Gate ISBT',
    busType: 'AC Electric',
    totalDistanceKm: 28.5,
    stopsCount: 32,
    frequencyMinutes: 10,
    firstBus: '05:30 AM',
    lastBus: '11:15 PM',
    status: 'Active',
    stops: [
      { id: 's1', name: 'Mehrauli Terminal', distanceKm: 0, stage: 1 },
      { id: 's2', name: 'Qutub Minar Metro', distanceKm: 2.1, stage: 1 },
      { id: 's3', name: 'Saket Crossing', distanceKm: 5.4, stage: 2 },
      { id: 's4', name: 'Hauz Khas', distanceKm: 9.2, stage: 3 },
      { id: 's5', name: 'AIIMS / Safdarjung', distanceKm: 13.8, stage: 4 },
      { id: 's6', name: 'INA Colony', distanceKm: 15.2, stage: 4 },
      { id: 's7', name: 'Janpath / CP', distanceKm: 21.0, stage: 5 },
      { id: 's7b', name: 'Delhi Gate', distanceKm: 23.5, stage: 6 },
      { id: 's8', name: 'New Delhi Rly Station', distanceKm: 25.2, stage: 6 },
      { id: 's9', name: 'Red Fort', distanceKm: 27.5, stage: 7 },
      { id: 's10', name: 'Kashmere Gate ISBT', distanceKm: 29.8, stage: 7 },
    ],
  },
  {
    id: 'rt-1b',
    routeNumber: '503',
    routeName: 'Malviya Nagar ⇄ Kashmere Gate ISBT (Non-AC)',
    origin: 'Saket Crossing',
    destination: 'Kashmere Gate ISBT',
    busType: 'Non-AC Standard',
    totalDistanceKm: 24.0,
    stopsCount: 28,
    frequencyMinutes: 12,
    firstBus: '05:45 AM',
    lastBus: '10:45 PM',
    status: 'Active',
    stops: [
      { id: 's1b-1', name: 'Saket Crossing', distanceKm: 0, stage: 1 },
      { id: 's1b-2', name: 'Hauz Khas', distanceKm: 4.1, stage: 2 },
      { id: 's1b-3', name: 'AIIMS / Safdarjung', distanceKm: 8.5, stage: 3 },
      { id: 's1b-4', name: 'INA Colony', distanceKm: 10.2, stage: 4 },
      { id: 's1b-5', name: 'Janpath / CP', distanceKm: 15.8, stage: 5 },
      { id: 's1b-5b', name: 'Delhi Gate', distanceKm: 18.2, stage: 6 },
      { id: 's1b-6', name: 'New Delhi Rly Station', distanceKm: 20.0, stage: 6 },
      { id: 's1b-7', name: 'Red Fort', distanceKm: 22.2, stage: 7 },
      { id: 's1b-8', name: 'Kashmere Gate ISBT', distanceKm: 24.5, stage: 7 },
    ],
  },
  {
    id: 'rt-2',
    routeNumber: '729',
    routeName: 'Kapashera Border ⇄ Mori Gate Terminal',
    origin: 'Kapashera Border',
    destination: 'Mori Gate Terminal',
    busType: 'AC Low Floor CNG',
    totalDistanceKm: 34.0,
    stopsCount: 38,
    frequencyMinutes: 12,
    firstBus: '05:00 AM',
    lastBus: '10:45 PM',
    status: 'Active',
    stops: [
      { id: 's21', name: 'Kapashera Border', distanceKm: 0, stage: 1 },
      { id: 's22', name: 'Samalka', distanceKm: 3.5, stage: 1 },
      { id: 's23', name: 'Mahipalpur', distanceKm: 8.2, stage: 2 },
      { id: 's24', name: 'Dhaula Kuan', distanceKm: 16.0, stage: 4 },
      { id: 's25', name: 'Karol Bagh Metro', distanceKm: 24.5, stage: 6 },
      { id: 's26', name: 'Mori Gate Terminal', distanceKm: 34.0, stage: 8 },
    ],
  },
  {
    id: 'rt-2b',
    routeNumber: '729A',
    routeName: 'Kapashera Border ⇄ Mori Gate Terminal (Non-AC)',
    origin: 'Kapashera Border',
    destination: 'Mori Gate Terminal',
    busType: 'Non-AC Standard',
    totalDistanceKm: 34.0,
    stopsCount: 38,
    frequencyMinutes: 15,
    firstBus: '05:30 AM',
    lastBus: '10:15 PM',
    status: 'Active',
    stops: [
      { id: 's21b', name: 'Kapashera Border', distanceKm: 0, stage: 1 },
      { id: 's22b', name: 'Samalka', distanceKm: 3.5, stage: 1 },
      { id: 's23b', name: 'Mahipalpur', distanceKm: 8.2, stage: 2 },
      { id: 's24b', name: 'Dhaula Kuan', distanceKm: 16.0, stage: 4 },
      { id: 's25b', name: 'Karol Bagh Metro', distanceKm: 24.5, stage: 6 },
      { id: 's26b', name: 'Mori Gate Terminal', distanceKm: 34.0, stage: 8 },
    ],
  },
  {
    id: 'rt-3',
    routeNumber: 'TMS (+)',
    routeName: 'Teevra Mudrika Seva (Outer Ring Road Clockwise)',
    origin: 'Wazirpur Depot',
    destination: 'Wazirpur Depot (Circular)',
    busType: 'AC Electric',
    totalDistanceKm: 52.0,
    stopsCount: 46,
    frequencyMinutes: 8,
    firstBus: '05:15 AM',
    lastBus: '11:45 PM',
    status: 'Active',
    stops: [
      { id: 's31', name: 'Wazirpur Depot', distanceKm: 0, stage: 1 },
      { id: 's32', name: 'Rohini Sector 7', distanceKm: 4.8, stage: 1 },
      { id: 's33', name: 'Peeragarhi Crossing', distanceKm: 11.2, stage: 3 },
      { id: 's34', name: 'Janakpuri District Centre', distanceKm: 19.5, stage: 5 },
      { id: 's35', name: 'Nehru Place Terminal', distanceKm: 36.4, stage: 8 },
      { id: 's36', name: 'Sarai Kale Khan ISBT', distanceKm: 43.0, stage: 9 },
      { id: 's37', name: 'Wazirpur Depot', distanceKm: 52.0, stage: 11 },
    ],
  },
  {
    id: 'rt-4',
    routeNumber: '615',
    routeName: 'Poorvanchal Hostel (JNU) ⇄ Minto Road',
    origin: 'JNU Old Campus',
    destination: 'Minto Road Terminal',
    busType: 'Non-AC Standard',
    totalDistanceKm: 18.2,
    stopsCount: 24,
    frequencyMinutes: 15,
    firstBus: '06:00 AM',
    lastBus: '09:30 PM',
    status: 'Active',
    stops: [
      { id: 's41', name: 'JNU Old Campus', distanceKm: 0, stage: 1 },
      { id: 's42', name: 'Munirka', distanceKm: 3.2, stage: 1 },
      { id: 's43', name: 'RK Puram Sec 1', distanceKm: 6.0, stage: 2 },
      { id: 's44', name: 'AIIMS / Safdarjung', distanceKm: 9.5, stage: 3 },
      { id: 's45', name: 'Janpath / CP', distanceKm: 16.5, stage: 5 },
      { id: 's46', name: 'Minto Road Terminal', distanceKm: 18.2, stage: 5 },
    ],
  },
  {
    id: 'rt-5',
    routeNumber: '419',
    routeName: 'Ambedkar Nagar Terminal ⇄ Old Delhi Railway Station',
    origin: 'Ambedkar Nagar Terminal',
    destination: 'Old Delhi Railway Station',
    busType: 'AC Low Floor CNG',
    totalDistanceKm: 24.5,
    stopsCount: 29,
    frequencyMinutes: 12,
    firstBus: '05:45 AM',
    lastBus: '10:30 PM',
    status: 'Active',
    stops: [
      { id: 's51', name: 'Ambedkar Nagar Terminal', distanceKm: 0, stage: 1 },
      { id: 's52', name: 'Pushp Vihar', distanceKm: 2.8, stage: 1 },
      { id: 's52b', name: 'Saket Crossing', distanceKm: 5.2, stage: 2 },
      { id: 's53', name: 'Chirag Delhi', distanceKm: 7.6, stage: 2 },
      { id: 's54', name: 'Moolchand Hospital', distanceKm: 11.8, stage: 3 },
      { id: 's54b', name: 'AIIMS / Safdarjung', distanceKm: 14.2, stage: 4 },
      { id: 's55', name: 'Delhi Gate', distanceKm: 20.5, stage: 5 },
      { id: 's55b', name: 'Red Fort', distanceKm: 22.8, stage: 6 },
      { id: 's56', name: 'Old Delhi Railway Station', distanceKm: 24.5, stage: 6 },
    ],
  },
  {
    id: 'rt-6',
    routeNumber: '406',
    routeName: 'AIIMS / Safdarjung ⇄ Old Delhi Railway Station',
    origin: 'AIIMS / Safdarjung',
    destination: 'Old Delhi Railway Station',
    busType: 'AC Low Floor CNG',
    totalDistanceKm: 16.8,
    stopsCount: 22,
    frequencyMinutes: 15,
    firstBus: '05:30 AM',
    lastBus: '10:45 PM',
    status: 'Active',
    stops: [
      { id: 'r6s1', name: 'AIIMS / Safdarjung', distanceKm: 0, stage: 1 },
      { id: 'r6s2', name: 'Moolchand Hospital', distanceKm: 2.8, stage: 1 },
      { id: 'r6s3', name: 'Lajpat Nagar', distanceKm: 5.2, stage: 2 },
      { id: 'r6s4', name: 'Ashram Chowk', distanceKm: 7.6, stage: 2 },
      { id: 'r6s5', name: 'Delhi Gate', distanceKm: 12.4, stage: 3 },
      { id: 'r6s6', name: 'Red Fort', distanceKm: 14.9, stage: 4 },
      { id: 'r6s7', name: 'Old Delhi Railway Station', distanceKm: 16.8, stage: 4 },
    ],
  },
  {
    id: 'rt-6b',
    routeNumber: '406A',
    routeName: 'AIIMS / Safdarjung ⇄ Old Delhi Railway Station (Non-AC)',
    origin: 'AIIMS / Safdarjung',
    destination: 'Old Delhi Railway Station',
    busType: 'Non-AC Standard',
    totalDistanceKm: 16.8,
    stopsCount: 22,
    frequencyMinutes: 20,
    firstBus: '06:00 AM',
    lastBus: '10:00 PM',
    status: 'Active',
    stops: [
      { id: 'r6bs1', name: 'AIIMS / Safdarjung', distanceKm: 0, stage: 1 },
      { id: 'r6bs2', name: 'Moolchand Hospital', distanceKm: 2.8, stage: 1 },
      { id: 'r6bs3', name: 'Lajpat Nagar', distanceKm: 5.2, stage: 2 },
      { id: 'r6bs4', name: 'Ashram Chowk', distanceKm: 7.6, stage: 2 },
      { id: 'r6bs5', name: 'Delhi Gate', distanceKm: 12.4, stage: 3 },
      { id: 'r6bs6', name: 'Red Fort', distanceKm: 14.9, stage: 4 },
      { id: 'r6bs7', name: 'Old Delhi Railway Station', distanceKm: 16.8, stage: 4 },
    ],
  },
];

// Govt. Approved DTC Fare Slabs
const initialFareSlabs: FareSlab[] = [
  // Non-AC
  { id: 'f-1', busCategory: 'Non-AC Standard', minKm: 0, maxKm: 4, fare: 5 },
  { id: 'f-2', busCategory: 'Non-AC Standard', minKm: 4.1, maxKm: 10, fare: 10 },
  { id: 'f-3', busCategory: 'Non-AC Standard', minKm: 10.1, maxKm: 999, fare: 15 },
  // AC Low Floor & AC Electric
  { id: 'f-4', busCategory: 'AC Low Floor CNG', minKm: 0, maxKm: 4, fare: 10 },
  { id: 'f-5', busCategory: 'AC Low Floor CNG', minKm: 4.1, maxKm: 8, fare: 15 },
  { id: 'f-6', busCategory: 'AC Low Floor CNG', minKm: 8.1, maxKm: 12, fare: 20 },
  { id: 'f-7', busCategory: 'AC Low Floor CNG', minKm: 12.1, maxKm: 999, fare: 25 },
  // Electric AC
  { id: 'f-8', busCategory: 'AC Electric', minKm: 0, maxKm: 4, fare: 10 },
  { id: 'f-9', busCategory: 'AC Electric', minKm: 4.1, maxKm: 8, fare: 15 },
  { id: 'f-10', busCategory: 'AC Electric', minKm: 8.1, maxKm: 12, fare: 20 },
  { id: 'f-11', busCategory: 'AC Electric', minKm: 12.1, maxKm: 999, fare: 25 },
];

// Initial No-Ticket Challans
const initialNoTicketChallans: NoTicketChallan[] = [
  {
    id: 'ch-1',
    challanNumber: 'DTC-CH-2026-1041',
    passengerName: 'Ramesh Sharma',
    passengerPhone: '9871234560',
    passengerAge: 34,
    gender: 'Male',
    busNumber: 'DL 1PD 8412',
    routeNumber: '502',
    locationStop: 'AIIMS Metro / Safdarjung',
    conductorName: 'Rajesh Kumar (Cond.)',
    conductorBadge: 'DTC-C-4581',
    penaltyAmount: 200,
    fareDue: 25,
    totalAmount: 225,
    paymentMode: 'Cash',
    status: 'Paid on Spot',
    issuedAt: 'Today, 09:42 AM',
    notes: 'Passenger entered at Saket, refused to buy ticket stating short distance. Penalized under Sec 178 MV Act.',
  },
  {
    id: 'ch-2',
    challanNumber: 'DTC-CH-2026-1042',
    passengerName: 'Amit Verma',
    passengerPhone: '9810987654',
    passengerAge: 27,
    gender: 'Male',
    busNumber: 'DL 1PD 3319',
    routeNumber: '729',
    locationStop: 'Dhaula Kuan Interchange',
    conductorName: 'Sanjay Rawat (Squad Insp.)',
    conductorBadge: 'DTC-FS-102',
    penaltyAmount: 200,
    fareDue: 20,
    totalAmount: 220,
    paymentMode: 'Conductor UPI QR',
    status: 'Paid on Spot',
    issuedAt: 'Today, 10:15 AM',
    notes: 'Caught during flying squad surprise inspection on Ring Road flyover.',
  },
  {
    id: 'ch-3',
    challanNumber: 'DTC-CH-2026-1043',
    passengerName: 'Kuldeep Singh',
    passengerPhone: '9958112233',
    passengerAge: 42,
    gender: 'Male',
    busNumber: 'DL 1PC 9904',
    routeNumber: 'TMS (+)',
    locationStop: 'Peeragarhi Crossing',
    conductorName: 'Manoj Tiwari (Cond.)',
    conductorBadge: 'DTC-C-7720',
    penaltyAmount: 200,
    fareDue: 25,
    totalAmount: 225,
    paymentMode: 'Pending',
    status: 'Pending Payment',
    issuedAt: 'Today, 10:38 AM',
    notes: 'Passenger had no cash/online balance. Challan slip issued with 7-day payment window at Depot.',
  },
  {
    id: 'ch-4',
    challanNumber: 'DTC-CH-2026-1044',
    passengerName: 'Sunil Prasad',
    passengerPhone: '9711554433',
    passengerAge: 22,
    gender: 'Male',
    busNumber: 'DL 1PD 1205',
    routeNumber: '419',
    locationStop: 'Chirag Delhi',
    conductorName: 'Jagdish Chandra (Cond.)',
    conductorBadge: 'DTC-C-3389',
    penaltyAmount: 200,
    fareDue: 15,
    totalAmount: 215,
    paymentMode: 'Cash',
    status: 'Paid on Spot',
    issuedAt: 'Today, 11:05 AM',
    notes: 'Claimed to have lost phone while boarding.',
  },
];

// Initial Invalid Ticket Violations
const initialInvalidTickets: InvalidTicketViolation[] = [
  {
    id: 'inv-1',
    ticketId: 'QR-DTC-98214',
    passengerName: 'Vikas Gupta',
    reason: 'QR Code Expired',
    busNumber: 'DL 1PD 8412',
    routeNumber: '502',
    detectedAtStop: 'Hauz Khas',
    conductorName: 'Rajesh Kumar (Cond.)',
    conductorBadge: 'DTC-C-4581',
    fareDifference: 0,
    penaltyAmount: 200,
    actionTaken: 'Penalty Levied',
    status: 'Resolved',
    timestamp: 'Today, 09:15 AM',
  },
  {
    id: 'inv-2',
    ticketId: 'QR-DTC-88124',
    passengerName: 'Mohd. Imran',
    reason: 'Non-AC Ticket in AC Bus',
    busNumber: 'DL 1PD 4450',
    routeNumber: '729',
    detectedAtStop: 'Mahipalpur',
    conductorName: 'Suresh Negi (Cond.)',
    conductorBadge: 'DTC-C-6190',
    fareDifference: 10,
    penaltyAmount: 0,
    actionTaken: 'Difference Fare Collected',
    status: 'Resolved',
    timestamp: 'Today, 09:48 AM',
  },
  {
    id: 'inv-3',
    ticketId: 'QR-DTC-77641',
    passengerName: 'Rohit Mehra',
    reason: 'Duplicate / Screenshot Misuse',
    busNumber: 'DL 1PC 9904',
    routeNumber: 'TMS (+)',
    detectedAtStop: 'Janakpuri District Centre',
    conductorName: 'Manoj Tiwari (Cond.)',
    conductorBadge: 'DTC-C-7720',
    fareDifference: 0,
    penaltyAmount: 200,
    actionTaken: 'Penalty Levied',
    status: 'Resolved',
    timestamp: 'Today, 10:20 AM',
  },
  {
    id: 'inv-4',
    ticketId: 'QR-DTC-66219',
    passengerName: 'Anil Yadav',
    reason: 'Wrong Bus Route',
    busNumber: 'DL 1PD 1205',
    routeNumber: '419',
    detectedAtStop: 'Pushp Vihar',
    conductorName: 'Jagdish Chandra (Cond.)',
    conductorBadge: 'DTC-C-3389',
    fareDifference: 15,
    penaltyAmount: 0,
    actionTaken: 'Difference Fare Collected',
    status: 'Resolved',
    timestamp: 'Today, 10:52 AM',
  },
  {
    id: 'inv-5',
    ticketId: 'QR-DTC-55118',
    passengerName: 'Deepak Kohli',
    reason: 'Over-travel (Beyond Destination)',
    busNumber: 'DL 1PD 8412',
    routeNumber: '502',
    detectedAtStop: 'Kashmere Gate ISBT',
    conductorName: 'Rajesh Kumar (Cond.)',
    conductorBadge: 'DTC-C-4581',
    fareDifference: 10,
    penaltyAmount: 50,
    actionTaken: 'Difference Fare Collected',
    status: 'Resolved',
    timestamp: 'Today, 11:10 AM',
  },
];

// Initial DTC Notices
const initialNotices: DtcNotice[] = [
  {
    id: 'not-1',
    noticeNumber: 'DTC/HQ/OPS/2026/184',
    title: 'Route Diversion: Central Secretariat & Kartavya Path Area',
    content: 'Due to VIP movement and infrastructure rehearsal, all buses on routes 502, 615 and 419 will be diverted via C-Hexagon and Barakhamba Road until 18:00 hrs. Conductors must inform commuters at boarding.',
    category: 'Route Diversion',
    priority: 'Urgent',
    targetAudience: 'All',
    issuedBy: 'General Manager (Traffic Operations)',
    publishedAt: 'Today, 08:00 AM',
    validUntil: 'Today, 06:00 PM',
    isActive: true,
  },
  {
    id: 'not-2',
    noticeNumber: 'DTC/HQ/REV/2026/092',
    title: 'Strict Vigil on Ticketless Travel & QR Pass Verification',
    content: 'Special Flying Squad teams deployed on Ring Road Mudrika and Outer Ring Road corridors. Conductors must ensure every female passenger is issued a physical/digital Pink Pass (Free) and all digital QR codes are scanned through ETIM.',
    category: 'Operations',
    priority: 'High',
    targetAudience: 'Conductors & Drivers',
    issuedBy: 'Chief Vigilance Officer, DTC',
    publishedAt: 'Today, 07:30 AM',
    validUntil: 'Nov 30, 2026',
    isActive: true,
  },
  {
    id: 'not-3',
    noticeNumber: 'DTC/DEP/EV/2026/304',
    title: 'Mandatory EV Charging Protocol at Millennium & Rajghat Depots',
    content: 'All drivers of Tata Starbus EV fleet returning after morning shift must park in designated bays (Bay 12 to 28) for 45-minute fast charging cycle before shift handover.',
    category: 'Maintenance',
    priority: 'Normal',
    targetAudience: 'Depot Managers',
    issuedBy: 'Chief Engineer (Electric Fleet)',
    publishedAt: 'Yesterday, 04:00 PM',
    validUntil: 'Dec 15, 2026',
    isActive: true,
  },
  {
    id: 'not-4',
    noticeNumber: 'DTC/PUB/2026/019',
    title: 'Public Notice: Instant Ticket Booking & UPI Refund in Passenger App',
    content: 'Commuters can now purchase single journey QR tickets up to 10 minutes prior to boarding and claim instant automated UPI refund if bus trip is cancelled or broken down.',
    category: 'Public Advisory',
    priority: 'Normal',
    targetAudience: 'Passengers',
    issuedBy: 'Public Relations Officer (PRO)',
    publishedAt: 'Nov 14, 2026',
    validUntil: 'Dec 31, 2026',
    isActive: true,
  },
];

// Initial Conductor Duties
const initialDuties: ConductorDuty[] = [
  {
    id: 'cd-1',
    conductorName: 'Rajesh Kumar',
    badgeNumber: 'DTC-C-4581',
    phone: '9871239981',
    depot: 'Sarojini Nagar Depot',
    busNumber: 'DL 1PD 8412',
    routeNumber: '502',
    shift: 'Morning (06:00 - 14:00)',
    dutyStartTime: '05:45 AM',
    etimMachineId: 'ETIM-SN-402',
    ticketsSoldDigital: 184,
    ticketsSoldCash: 96,
    pinkTicketsIssued: 142,
    totalCashCollected: 1920,
    status: 'On Duty',
  },
  {
    id: 'cd-2',
    conductorName: 'Suresh Negi',
    badgeNumber: 'DTC-C-6190',
    phone: '9811442299',
    depot: 'BBM Depot (Kingsway Camp)',
    busNumber: 'DL 1PD 4450',
    routeNumber: '729',
    shift: 'Morning (06:00 - 14:00)',
    dutyStartTime: '05:30 AM',
    etimMachineId: 'ETIM-BBM-118',
    ticketsSoldDigital: 210,
    ticketsSoldCash: 114,
    pinkTicketsIssued: 168,
    totalCashCollected: 2280,
    status: 'On Duty',
  },
  {
    id: 'cd-3',
    conductorName: 'Manoj Tiwari',
    badgeNumber: 'DTC-C-7720',
    phone: '9990114477',
    depot: 'Wazirpur Depot',
    busNumber: 'DL 1PC 9904',
    routeNumber: 'TMS (+)',
    shift: 'Morning (06:00 - 14:00)',
    dutyStartTime: '05:50 AM',
    etimMachineId: 'ETIM-WZ-89',
    ticketsSoldDigital: 245,
    ticketsSoldCash: 80,
    pinkTicketsIssued: 195,
    totalCashCollected: 1600,
    status: 'On Duty',
  },
  {
    id: 'cd-4',
    conductorName: 'Harish Chandra',
    badgeNumber: 'DTC-C-2210',
    phone: '9868331100',
    depot: 'Sukhdev Vihar Depot',
    busNumber: 'DL 1PD 2881',
    routeNumber: '419',
    shift: 'Morning (06:00 - 14:00)',
    dutyStartTime: '06:00 AM',
    etimMachineId: 'ETIM-SV-310',
    ticketsSoldDigital: 130,
    ticketsSoldCash: 70,
    pinkTicketsIssued: 88,
    totalCashCollected: 1400,
    status: 'Handed Over',
  },
];

// Initial Conductor Attendance Records
const initialAttendances: ConductorAttendance[] = [
  {
    id: 'att-1',
    conductorName: 'Rajesh Kumar',
    badgeNumber: 'DTC-C-4581',
    depot: 'Sarojini Nagar Depot',
    busNumber: 'DL 1PD 8412',
    routeNumber: '502',
    shift: 'Morning (06:00 - 14:00)',
    date: '19 Nov 2026',
    punchInTime: '05:45 AM',
    status: 'Present',
    depotLocation: 'Sarojini Nagar Depot (Gate 2 Biometric)',
    gpsLocation: '28.5708° N, 77.1974° E',
    verifiedBy: 'DTC Biometric & GPS Punch',
  },
  {
    id: 'att-2',
    conductorName: 'Suresh Negi',
    badgeNumber: 'DTC-C-6190',
    depot: 'BBM Depot (Kingsway Camp)',
    busNumber: 'DL 1PD 4450',
    routeNumber: '729',
    shift: 'Morning (06:00 - 14:00)',
    date: '19 Nov 2026',
    punchInTime: '05:30 AM',
    status: 'Present',
    depotLocation: 'BBM Depot Kingsway Camp',
    gpsLocation: '28.7041° N, 77.2025° E',
    verifiedBy: 'DTC Biometric & GPS Punch',
  },
  {
    id: 'att-3',
    conductorName: 'Harish Chandra',
    badgeNumber: 'DTC-C-2210',
    depot: 'Sukhdev Vihar Depot',
    busNumber: 'DL 1PD 2881',
    routeNumber: '419',
    shift: 'Morning (06:00 - 14:00)',
    date: '18 Nov 2026',
    punchInTime: '06:00 AM',
    punchOutTime: '02:00 PM',
    status: 'Shift Completed',
    depotLocation: 'Sukhdev Vihar Depot',
    gpsLocation: '28.5583° N, 77.2797° E',
    verifiedBy: 'DTC Biometric & GPS Punch',
  },
];

// Initial Shift Handovers
const initialHandovers: ShiftHandover[] = [
  {
    id: 'sh-1',
    handoverCode: 'HND-2026-401',
    fromConductor: 'Harish Chandra',
    fromBadge: 'DTC-C-2210',
    toConductor: 'Jagdish Chandra',
    toBadge: 'DTC-C-3389',
    busNumber: 'DL 1PD 1205',
    routeNumber: '419',
    handoverStop: 'Lajpat Nagar Terminal',
    cashHandedOver: 1400,
    etimStatus: 'Healthy',
    handoverTime: '10:45 AM',
    status: 'Accepted',
    notes: 'Shift switch completed smoothly. Total 288 passengers carried in round 1.',
  },
];

// Initial Passenger Tickets
const initialTickets: PassengerTicket[] = [
  {
    id: 'tk-1',
    ticketNumber: 'DTC-TK-90812',
    passengerName: 'Aarav Sharma',
    passengerPhone: '9810123456',
    phone: '9810123456',
    routeNumber: '502',
    sourceStop: 'Saket Crossing',
    boardingStop: 'Saket Crossing',
    destinationStop: 'Janpath / CP',
    busType: 'AC Electric',
    fare: 20,
    passengersCount: 1,
    totalAmount: 20,
    bookedAt: 'Today, 10:12 AM',
    validUntil: 'Today, 12:12 PM',
    qrCodeData: 'DTC|DTC-TK-90812-P1|502|Saket Crossing|Janpath / CP|INR20|VALID',
    individualQrs: [
      {
        passengerIndex: 1,
        passengerLabel: 'Passenger 1 of 1',
        passengerType: 'Adult',
        qrSerial: 'DTC-TK-90812-P1',
        qrCodeData: 'DTC|DTC-TK-90812-P1|RT_502|Saket Crossing|Janpath / CP|INR20|VALID_1',
        fare: 20,
        status: 'Valid',
      },
    ],
    status: 'Valid',
  },
  {
    id: 'tk-2',
    ticketNumber: 'DTC-TK-90813',
    passengerName: 'Aarav Sharma',
    passengerPhone: '9899887766',
    phone: '9899887766',
    routeNumber: '729',
    sourceStop: 'Mahipalpur',
    boardingStop: 'Mahipalpur',
    destinationStop: 'Dhaula Kuan',
    busType: 'AC Low Floor CNG',
    fare: 15,
    passengersCount: 2,
    totalAmount: 30,
    bookedAt: 'Today, 09:30 AM',
    validUntil: 'Today, 11:30 AM',
    qrCodeData: 'DTC|DTC-TK-90813|729|Mahipalpur|Dhaula Kuan|30|SCANNED',
    individualQrs: [
      {
        passengerIndex: 1,
        passengerLabel: 'Passenger 1 of 2',
        passengerType: 'Adult',
        qrSerial: 'DTC-TK-90813-P1',
        qrCodeData: 'DTC|DTC-TK-90813-P1|RT_729|Mahipalpur|Dhaula Kuan|INR15|SCANNED',
        fare: 15,
        status: 'Scanned & Used',
      },
      {
        passengerIndex: 2,
        passengerLabel: 'Passenger 2 of 2',
        passengerType: 'Adult',
        qrSerial: 'DTC-TK-90813-P2',
        qrCodeData: 'DTC|DTC-TK-90813-P2|RT_729|Mahipalpur|Dhaula Kuan|INR15|SCANNED',
        fare: 15,
        status: 'Scanned & Used',
      },
    ],
    status: 'Scanned & Used',
  },
  {
    id: 'tk-3',
    ticketNumber: 'DTC-TK-90814',
    passengerName: 'Aarav Sharma',
    passengerPhone: '9711223344',
    phone: '9711223344',
    routeNumber: '615',
    sourceStop: 'Munirka',
    boardingStop: 'Munirka',
    destinationStop: 'Safdarjung Hospital',
    busType: 'Non-AC Standard',
    fare: 10,
    passengersCount: 1,
    totalAmount: 10,
    bookedAt: 'Today, 08:15 AM',
    validUntil: 'Today, 10:15 AM',
    qrCodeData: 'DTC|DTC-TK-90814-P1|615|Munirka|Safdarjung Hospital|10|EXPIRED',
    individualQrs: [
      {
        passengerIndex: 1,
        passengerLabel: 'Passenger 1 of 1',
        passengerType: 'Adult',
        qrSerial: 'DTC-TK-90814-P1',
        qrCodeData: 'DTC|DTC-TK-90814-P1|RT_615|Munirka|Safdarjung Hospital|INR10|EXPIRED',
        fare: 10,
        status: 'Expired',
      },
    ],
    status: 'Expired',
  },
];

// Initial Passes
const initialPasses: DtcPass[] = [
  {
    id: 'p-1',
    passNumber: 'DTC-PASS-80921',
    holderName: 'Priya Sharma',
    holderPhone: '9810192837',
    passType: 'Pink Pass (Free)',
    cost: 0,
    issuedDate: '17-Nov-2026',
    validUntil: '17-Nov-2026',
    status: 'Active',
  },
  {
    id: 'p-2',
    passNumber: 'DTC-PASS-80922',
    holderName: 'Arjun Kapoor',
    holderPhone: '9910283746',
    passType: 'Daily AC',
    cost: 50,
    issuedDate: '17-Nov-2026',
    validUntil: '17-Nov-2026',
    status: 'Active',
  },
  {
    id: 'p-3',
    passNumber: 'DTC-PASS-80923',
    holderName: 'Kunal Malhotra',
    holderPhone: '9711445566',
    passType: 'Monthly General',
    cost: 1000,
    issuedDate: '01-Nov-2026',
    validUntil: '30-Nov-2026',
    status: 'Active',
  },
];

// Initial Refund Requests
const initialRefunds: RefundRequest[] = [
  {
    id: 'ref-1',
    ticketNumber: 'DTC-TK-89102',
    passengerName: 'Ananya Saxena',
    phone: '9873456781',
    amount: 25,
    reason: 'Bus Breakdown',
    requestedAt: 'Today, 09:55 AM',
    status: 'Pending',
    resolutionNotes: 'Bus DL 1PD 8412 had flat tyre near Hauz Khas. Auto-validation confirmed.',
  },
  {
    id: 'ref-2',
    ticketNumber: 'DTC-TK-87110',
    passengerName: 'Mohit Bhatia',
    phone: '9810099887',
    amount: 20,
    reason: 'Double Debited',
    requestedAt: 'Today, 10:20 AM',
    status: 'Pending',
    resolutionNotes: 'UPI transaction showed two deductions for ticket ID 87110.',
  },
  {
    id: 'ref-3',
    ticketNumber: 'DTC-TK-84091',
    passengerName: 'Sanjay Dutt',
    phone: '9811223344',
    amount: 15,
    reason: 'Route Diverted',
    requestedAt: 'Yesterday, 05:40 PM',
    status: 'Approved',
    resolutionNotes: 'Refund of ₹15 processed to UPI ID.',
  },
];

// Initial Live Buses
const initialLiveBuses: LiveBus[] = [
  {
    id: 'bus-1',
    busNumber: 'DL 1PD 8412',
    routeNumber: '502',
    busType: 'AC Electric',
    depot: 'Sarojini Nagar Depot',
    driverName: 'Balwan Singh',
    conductorName: 'Rajesh Kumar',
    currentSpeedKmH: 38,
    currentStop: 'INA Colony',
    nextStop: 'Janpath / CP',
    etaNextStopMins: 4,
    occupancyPercent: 82,
    status: 'On Route',
  },
  {
    id: 'bus-1c',
    busNumber: 'DL 1PD 6214',
    routeNumber: '502',
    busType: 'AC Electric',
    depot: 'Sarojini Nagar Depot',
    driverName: 'Harish Chand',
    conductorName: 'Dharmendra Pal',
    currentSpeedKmH: 35,
    currentStop: 'Hauz Khas',
    nextStop: 'AIIMS / Safdarjung',
    etaNextStopMins: 12,
    occupancyPercent: 55,
    status: 'On Route',
  },
  {
    id: 'bus-1d',
    busNumber: 'DL 1PD 9043',
    routeNumber: '502',
    busType: 'AC Electric',
    depot: 'Mehrauli Depot',
    driverName: 'Vinod Kumar',
    conductorName: 'Sunil Dutt',
    currentSpeedKmH: 30,
    currentStop: 'Saket Crossing',
    nextStop: 'Hauz Khas',
    etaNextStopMins: 22,
    occupancyPercent: 42,
    status: 'On Route',
  },
  {
    id: 'bus-1b',
    busNumber: 'DL 1PD 3110',
    routeNumber: '503',
    busType: 'Non-AC Standard',
    depot: 'Sarojini Nagar Depot',
    driverName: 'Rampal Yadav',
    conductorName: 'Kishore Kumar',
    currentSpeedKmH: 32,
    currentStop: 'Hauz Khas',
    nextStop: 'AIIMS / Safdarjung',
    etaNextStopMins: 7,
    occupancyPercent: 60,
    status: 'On Route',
  },
  {
    id: 'bus-1e',
    busNumber: 'DL 1PD 1892',
    routeNumber: '503',
    busType: 'Non-AC Standard',
    depot: 'Sarojini Nagar Depot',
    driverName: 'Sombir Singh',
    conductorName: 'Deepak Rawat',
    currentSpeedKmH: 28,
    currentStop: 'Saket Crossing',
    nextStop: 'Hauz Khas',
    etaNextStopMins: 18,
    occupancyPercent: 48,
    status: 'On Route',
  },
  {
    id: 'bus-2',
    busNumber: 'DL 1PD 4450',
    routeNumber: '729',
    busType: 'AC Low Floor CNG',
    depot: 'BBM Depot',
    driverName: 'Satender Pal',
    conductorName: 'Suresh Negi',
    currentSpeedKmH: 26,
    currentStop: 'Mahipalpur Flyover',
    nextStop: 'Dhaula Kuan',
    etaNextStopMins: 9,
    occupancyPercent: 94,
    status: 'On Route',
  },
  {
    id: 'bus-2b',
    busNumber: 'DL 1PD 2099',
    routeNumber: '729A',
    busType: 'Non-AC Standard',
    depot: 'BBM Depot',
    driverName: 'Jitender Kumar',
    conductorName: 'Rameshwar Dayal',
    currentSpeedKmH: 30,
    currentStop: 'Samalka',
    nextStop: 'Mahipalpur',
    etaNextStopMins: 5,
    occupancyPercent: 75,
    status: 'On Route',
  },
  {
    id: 'bus-3',
    busNumber: 'DL 1PC 9904',
    routeNumber: 'TMS (+)',
    busType: 'AC Electric',
    depot: 'Wazirpur Depot',
    driverName: 'Gurmeet Singh',
    conductorName: 'Manoj Tiwari',
    currentSpeedKmH: 42,
    currentStop: 'Janakpuri District Centre',
    nextStop: 'Nehru Place Terminal',
    etaNextStopMins: 14,
    occupancyPercent: 70,
    status: 'On Route',
  },
  {
    id: 'bus-4',
    busNumber: 'DL 1PD 1205',
    routeNumber: '419',
    busType: 'AC Low Floor CNG',
    depot: 'Sukhdev Vihar Depot',
    driverName: 'Devender Kumar',
    conductorName: 'Jagdish Chandra',
    currentSpeedKmH: 18,
    currentStop: 'Chirag Delhi',
    nextStop: 'Moolchand Hospital',
    etaNextStopMins: 11,
    occupancyPercent: 65,
    status: 'Delayed',
  },
  {
    id: 'bus-4b',
    busNumber: 'DL 1PD 2881',
    routeNumber: '419',
    busType: 'AC Low Floor CNG',
    depot: 'Sukhdev Vihar Depot',
    driverName: 'Subhash Chand',
    conductorName: 'Harish Chandra',
    currentSpeedKmH: 26,
    currentStop: 'Moolchand Hospital',
    nextStop: 'AIIMS / Safdarjung',
    etaNextStopMins: 8,
    occupancyPercent: 52,
    status: 'On Route',
  },
  {
    id: 'bus-6a',
    busNumber: 'DL 1PD 7731',
    routeNumber: '406',
    busType: 'AC Low Floor CNG',
    depot: 'Sarojini Nagar Depot',
    driverName: 'Pradeep Kumar',
    conductorName: 'Ashok Sharma',
    currentSpeedKmH: 32,
    currentStop: 'AIIMS / Safdarjung',
    nextStop: 'Moolchand Hospital',
    etaNextStopMins: 6,
    occupancyPercent: 58,
    status: 'On Route',
  },
  {
    id: 'bus-6b',
    busNumber: 'DL 1PD 5509',
    routeNumber: '406',
    busType: 'AC Low Floor CNG',
    depot: 'Sarojini Nagar Depot',
    driverName: 'Naresh Pal',
    conductorName: 'Bhupender Singh',
    currentSpeedKmH: 28,
    currentStop: 'Lajpat Nagar',
    nextStop: 'Ashram Chowk',
    etaNextStopMins: 3,
    occupancyPercent: 71,
    status: 'On Route',
  },
  {
    id: 'bus-6c',
    busNumber: 'DL 1PD 4418',
    routeNumber: '406A',
    busType: 'Non-AC Standard',
    depot: 'Sarojini Nagar Depot',
    driverName: 'Ramesh Lal',
    conductorName: 'Dinesh Kumar',
    currentSpeedKmH: 24,
    currentStop: 'AIIMS / Safdarjung',
    nextStop: 'Moolchand Hospital',
    etaNextStopMins: 9,
    occupancyPercent: 44,
    status: 'On Route',
  },
];

// Initial Support Tickets
const initialSupportTickets: SupportTicket[] = [
  {
    id: 'sup-1',
    ticketNumber: 'TKT-2026-8841',
    passengerName: 'Pooja Sharma',
    passengerPhone: '+91 98112 34567',
    passengerEmail: 'pooja.sharma@gmail.com',
    category: 'ETIM & Digital QR Failure',
    priority: 'Urgent',
    status: 'Open',
    channel: 'Passenger Mobile App',
    busNumber: 'DL 1PD 8412',
    routeNumber: '502',
    depot: 'Sarojini Nagar Depot',
    subject: 'UPI debited ₹25 for Route 502, but ETIM machine failed to issue QR ticket',
    description: 'At INA Colony bus stop, commuter scanned conductor UPI machine. Account debited reference UPI/48192031, but machine displayed "Network Timeout". Commuter had to purchase cash ticket again.',
    assignedOfficer: 'Ramesh Chander (Helpdesk Tier 1)',
    createdAt: 'Today, 08:35 AM',
    updatedAt: 'Today, 08:42 AM',
    slaStatus: 'Within SLA',
  },
  {
    id: 'sup-2',
    ticketNumber: 'TKT-2026-8842',
    passengerName: 'Vikas Malhotra',
    passengerPhone: '+91 98731 44520',
    passengerEmail: 'vikas.m@outlook.com',
    category: 'Lost & Found Property',
    priority: 'High',
    status: 'In Progress',
    channel: 'Helpline (1800-11-8181)',
    busNumber: 'DL 1PD 4450',
    routeNumber: '729',
    depot: 'BBM Depot',
    subject: 'Black Lenovo ThinkPad laptop bag left on Seat 14',
    description: 'Commuter deboarded at Dhaula Kuan stop around 09:15 AM and inadvertently left laptop bag containing company ID and documents on overhead luggage rack.',
    assignedOfficer: 'Anand Kumar (Depot Vigilance Officer)',
    createdAt: 'Today, 09:25 AM',
    updatedAt: 'Today, 09:40 AM',
    resolutionNotes: 'Conductor Suresh Negi contacted. Bag recovered safely and kept in BBM Depot Lost & Found locker.',
    slaStatus: 'Within SLA',
  },
  {
    id: 'sup-3',
    ticketNumber: 'TKT-2026-8843',
    passengerName: 'Sunita Devi',
    passengerPhone: '+91 99105 88219',
    category: 'Pink Pass & Concession',
    priority: 'High',
    status: 'Escalated to Depot',
    channel: 'WhatsApp Bot',
    busNumber: 'DL 1PC 9904',
    routeNumber: 'TMS (+)',
    depot: 'Wazirpur Depot',
    subject: 'Conductor refused to issue Zero-Fare Pink Ticket at Janakpuri',
    description: 'Conductor claimed ETIM machine paper roll ran out and demanded ₹15 cash from female commuter instead of providing Pink Free Pass.',
    assignedOfficer: 'Sunil Dutt (Senior Operations Inspector)',
    createdAt: 'Today, 10:10 AM',
    updatedAt: 'Today, 10:30 AM',
    resolutionNotes: 'Escalated to Wazirpur Depot Manager. Show-cause notice issued to conductor Manoj Tiwari.',
    slaStatus: 'Near Breach',
  },
  {
    id: 'sup-4',
    ticketNumber: 'TKT-2026-8844',
    passengerName: 'Amit Saxena',
    passengerPhone: '+91 98101 22345',
    passengerEmail: 'amit.saxena@tcs.com',
    category: 'Route Delay & Missed Stop',
    priority: 'Medium',
    status: 'Open',
    channel: 'Web Portal',
    busNumber: 'DL 1PD 1205',
    routeNumber: '419',
    depot: 'Sukhdev Vihar Depot',
    subject: 'Bus driver intentionally skipped Chirag Delhi bus shelter',
    description: 'At 10:45 AM, Bus DL 1PD 1205 drove through the middle lane without halting at designated Chirag Delhi bus stop despite over 15 commuters waiting.',
    assignedOfficer: 'Praveen Yadav (Customer Care Lead)',
    createdAt: 'Today, 11:00 AM',
    updatedAt: 'Today, 11:05 AM',
    slaStatus: 'Within SLA',
  },
  {
    id: 'sup-5',
    ticketNumber: 'TKT-2026-8845',
    passengerName: 'Rohit Verma',
    passengerPhone: '+91 98990 12874',
    category: 'Fare Dispute & Overcharging',
    priority: 'Medium',
    status: 'Resolved',
    channel: 'Passenger Mobile App',
    routeNumber: '615',
    depot: 'Vasant Vihar Depot',
    subject: 'Incorrect fare stage calculation: charged ₹20 instead of ₹15',
    description: 'Distance between Moti Bagh and AIIMS is 6.2 km which falls under Slab 2 (₹15 for AC). Conductor charged ₹20.',
    assignedOfficer: 'Ramesh Chander (Helpdesk Tier 1)',
    createdAt: 'Yesterday, 04:20 PM',
    updatedAt: 'Today, 09:10 AM',
    resolutionNotes: 'Fare calculation checked against GPS stage distance. ₹5 excess credited back to commuter wallet.',
    slaStatus: 'Within SLA',
  },
  {
    id: 'sup-6',
    ticketNumber: 'TKT-2026-8846',
    passengerName: 'Kavita Rawat',
    passengerPhone: '+91 97112 55901',
    category: 'Women Safety & SOS',
    priority: 'Urgent',
    status: 'Resolved',
    channel: 'Depot Helpdesk',
    busNumber: 'DL 1PD 8412',
    routeNumber: '502',
    depot: 'Sarojini Nagar Depot',
    subject: 'Immediate emergency alert verified & marshals deployed',
    description: 'Commuter reported harassment near Saket Crossing. Bus marshal intervened immediately and escorted offender to Saket Police station.',
    assignedOfficer: 'Vigilance Quick Response Team',
    createdAt: 'Yesterday, 07:15 PM',
    updatedAt: 'Yesterday, 08:00 PM',
    resolutionNotes: 'Police FIR lodged at Saket PS. Passenger escorted safely.',
    slaStatus: 'Within SLA',
  },
];

// Initial Commuter Profile
const initialPassengerProfile: PassengerProfile = {
  name: 'Priya Sharma',
  phone: '+91 98112 34567',
  email: 'priya.sharma@gmail.com',
  gender: 'Female',
  walletBalance: 240,
  dtcCardNumber: 'DTC-CARD-9921-4820',
};

export const useDtcStore = create<DtcState>()(
  persist(
    (set, get) => ({
      routes: initialRoutes,
      fareSlabs: initialFareSlabs,
      noTicketChallans: initialNoTicketChallans,
      invalidTicketViolations: initialInvalidTickets,
      notices: initialNotices,
      conductorDuties: initialDuties,
      conductorAttendances: initialAttendances,
      shiftHandovers: initialHandovers,
      passengerTickets: initialTickets,
      passes: initialPasses,
      refundRequests: initialRefunds,
      liveBuses: initialLiveBuses,
      supportTickets: initialSupportTickets,
      passengerProfile: initialPassengerProfile,

      addNoTicketChallan: (data) => {
        const count = get().noTicketChallans.length + 1045;
        const newChallan: NoTicketChallan = {
          ...data,
          id: `ch-${Date.now()}`,
          challanNumber: `DTC-CH-2026-${count}`,
          issuedAt: 'Just Now',
        };
        set((state) => ({
          noTicketChallans: [newChallan, ...state.noTicketChallans],
        }));
      },

      updateChallanStatus: (id, status, paymentMode) => {
        set((state) => ({
          noTicketChallans: state.noTicketChallans.map((ch) =>
            ch.id === id
              ? {
                  ...ch,
                  status,
                  ...(paymentMode ? { paymentMode } : {}),
                }
              : ch
          ),
        }));
      },

      addInvalidTicketViolation: (data) => {
        const newViolation: InvalidTicketViolation = {
          ...data,
          id: `inv-${Date.now()}`,
          timestamp: 'Just Now',
        };
        set((state) => ({
          invalidTicketViolations: [newViolation, ...state.invalidTicketViolations],
        }));
      },

      updateInvalidTicketAction: (id, actionTaken, status) => {
        set((state) => ({
          invalidTicketViolations: state.invalidTicketViolations.map((v) =>
            v.id === id ? { ...v, actionTaken, status } : v
          ),
        }));
      },

      addNotice: (data) => {
        const count = get().notices.length + 200;
        const newNotice: DtcNotice = {
          ...data,
          id: `not-${Date.now()}`,
          noticeNumber: `DTC/HQ/2026/${count}`,
          publishedAt: 'Just Now',
          isActive: true,
        };
        set((state) => ({
          notices: [newNotice, ...state.notices],
        }));
      },

      toggleNoticeActive: (id) => {
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id === id ? { ...n, isActive: !n.isActive } : n
          ),
        }));
      },

      deleteNotice: (id) => {
        set((state) => ({
          notices: state.notices.filter((n) => n.id !== id),
        }));
      },

      addRoute: (route) => {
        const newRoute: DtcRoute = {
          ...route,
          id: `rt-${Date.now()}`,
        };
        set((state) => ({
          routes: [...state.routes, newRoute],
        }));
      },

      updateRouteStatus: (id, status) => {
        set((state) => ({
          routes: state.routes.map((r) => (r.id === id ? { ...r, status } : r)),
        }));
      },

      startConductorDuty: (duty) => {
        const newDuty: ConductorDuty = {
          ...duty,
          id: `cd-${Date.now()}`,
          dutyStartTime: 'Just Now',
          ticketsSoldDigital: 0,
          ticketsSoldCash: 0,
          pinkTicketsIssued: 0,
          totalCashCollected: 0,
          status: 'On Duty',
        };
        set((state) => ({
          conductorDuties: [newDuty, ...state.conductorDuties],
        }));
      },

      punchInAttendance: (data) => {
        const state = get();
        const targetDuty = state.conductorDuties.find((d) => d.id === data.dutyId) || state.conductorDuties[0];
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        const newAttendance: ConductorAttendance = {
          id: `att-${Date.now()}`,
          conductorName: targetDuty.conductorName,
          badgeNumber: targetDuty.badgeNumber,
          depot: targetDuty.depot,
          busNumber: targetDuty.busNumber,
          routeNumber: targetDuty.routeNumber,
          shift: data.shift || targetDuty.shift,
          date: dateStr,
          punchInTime: timeStr,
          status: 'Present',
          depotLocation: data.location || `${targetDuty.depot} (Main Gate Biometric)`,
          gpsLocation: '28.5708° N, 77.1974° E',
          verifiedBy: 'DTC Biometric & GPS Punch',
        };

        set((s) => ({
          activeDutyId: targetDuty.id,
          conductorDuties: s.conductorDuties.map((d) =>
            d.id === targetDuty.id
              ? {
                  ...d,
                  status: 'On Duty',
                  dutyStartTime: timeStr,
                  shift: (data.shift as any) || d.shift,
                }
              : d
          ),
          conductorAttendances: [newAttendance, ...s.conductorAttendances],
        }));
      },

      endConductorDuty: (id, totalCashCollected) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        set((state) => ({
          conductorDuties: state.conductorDuties.map((d) =>
            d.id === id
              ? {
                  ...d,
                  dutyEndTime: timeStr,
                  totalCashCollected,
                  status: 'Shift Completed',
                }
              : d
          ),
          conductorAttendances: state.conductorAttendances.map((a, idx) =>
            idx === 0 && !a.punchOutTime
              ? { ...a, punchOutTime: timeStr, status: 'Shift Completed' }
              : a
          ),
        }));
      },

      recordShiftHandover: (handover) => {
        const count = get().shiftHandovers.length + 402;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const newHandover: ShiftHandover = {
          ...handover,
          id: `sh-${Date.now()}`,
          handoverCode: `HND-2026-${count}`,
          handoverTime: 'Just Now',
        };
        set((state) => ({
          shiftHandovers: [newHandover, ...state.shiftHandovers],
          conductorDuties: state.conductorDuties.map((d) =>
            d.badgeNumber === handover.fromBadge
              ? { ...d, status: 'Handed Over', dutyEndTime: timeStr }
              : d
          ),
          conductorAttendances: state.conductorAttendances.map((a) =>
            a.badgeNumber === handover.fromBadge && !a.punchOutTime
              ? { ...a, punchOutTime: timeStr, status: 'Handed Over' }
              : a
          ),
        }));
      },

      approveRefund: (id, notes) => {
        set((state) => ({
          refundRequests: state.refundRequests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'Approved',
                  resolutionNotes: notes || 'Refund processed via UPI Gateway',
                }
              : r
          ),
        }));
      },

      rejectRefund: (id, notes) => {
        set((state) => ({
          refundRequests: state.refundRequests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'Rejected',
                  resolutionNotes: notes || 'Rejected after GPS log verification',
                }
              : r
          ),
        }));
      },

      addSupportTicket: (ticket) => {
        const count = get().supportTickets.length + 8847;
        const newTicket: SupportTicket = {
          ...ticket,
          id: `sup-${Date.now()}`,
          ticketNumber: `TKT-2026-${count}`,
          createdAt: 'Just Now',
          updatedAt: 'Just Now',
          slaStatus: ticket.priority === 'Urgent' ? 'Within SLA' : 'Within SLA',
        };
        set((state) => ({
          supportTickets: [newTicket, ...state.supportTickets],
        }));
      },

      updateTicketStatus: (id, status, notes) => {
        set((state) => ({
          supportTickets: state.supportTickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  updatedAt: 'Just Now',
                  ...(notes ? { resolutionNotes: notes } : {}),
                }
              : t
          ),
        }));
      },

      assignTicketOfficer: (id, officerName) => {
        set((state) => ({
          supportTickets: state.supportTickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  assignedOfficer: officerName,
                  updatedAt: 'Just Now',
                }
              : t
          ),
        }));
      },

      bookPassengerTicket: (data) => {
        const profile = get().passengerProfile;
        const count = get().passengerTickets.length + 9421;
        const ticketNum = `DTC-QR-2026-${count}`;
        const adultC = data.adultCount !== undefined ? data.adultCount : data.passengersCount;
        const childC = data.childCount !== undefined ? data.childCount : 0;
        const pCount = Math.max(1, adultC + childC);
        const aFare = data.adultFare ?? data.fare;
        const cFare = data.childFare ?? Math.max(5, Math.floor(data.fare / 2));

        // Generate individual QR codes for each passenger
        const individualQrs: IndividualQrItem[] = [];
        let pIndex = 1;

        if (data.isConnecting && data.connectingLegs) {
          // Connecting Journey: Generate Leg 1 and Leg 2 QRs for each commuter
          for (let i = 0; i < adultC; i++) {
            const leg1Serial = `${ticketNum}-A${i + 1}-L1`;
            const leg2Serial = `${ticketNum}-A${i + 1}-L2`;
            individualQrs.push({
              passengerIndex: pIndex++,
              passengerLabel: `Adult ${i + 1} • Bus 1 (Rt ${data.connectingLegs.leg1Route})`,
              passengerType: 'Adult',
              qrSerial: leg1Serial,
              qrCodeData: `DTC|${leg1Serial}|RT_${data.connectingLegs.leg1Route}|${data.connectingLegs.leg1From}|${data.connectingLegs.leg1To}|INR_${aFare}|VALID`,
              fare: Math.floor(aFare / 2),
              status: 'Valid',
            });
            individualQrs.push({
              passengerIndex: pIndex++,
              passengerLabel: `Adult ${i + 1} • Bus 2 (Rt ${data.connectingLegs.leg2Route})`,
              passengerType: 'Adult',
              qrSerial: leg2Serial,
              qrCodeData: `DTC|${leg2Serial}|RT_${data.connectingLegs.leg2Route}|${data.connectingLegs.leg2From}|${data.connectingLegs.leg2To}|INR_${aFare}|VALID`,
              fare: Math.ceil(aFare / 2),
              status: 'Valid',
            });
          }

          for (let i = 0; i < childC; i++) {
            const leg1Serial = `${ticketNum}-C${i + 1}-L1`;
            const leg2Serial = `${ticketNum}-C${i + 1}-L2`;
            individualQrs.push({
              passengerIndex: pIndex++,
              passengerLabel: `Child ${i + 1} • Bus 1 (Rt ${data.connectingLegs.leg1Route})`,
              passengerType: 'Child',
              qrSerial: leg1Serial,
              qrCodeData: `DTC|${leg1Serial}|RT_${data.connectingLegs.leg1Route}|${data.connectingLegs.leg1From}|${data.connectingLegs.leg1To}|INR_${cFare}|VALID`,
              fare: Math.floor(cFare / 2),
              status: 'Valid',
            });
            individualQrs.push({
              passengerIndex: pIndex++,
              passengerLabel: `Child ${i + 1} • Bus 2 (Rt ${data.connectingLegs.leg2Route})`,
              passengerType: 'Child',
              qrSerial: leg2Serial,
              qrCodeData: `DTC|${leg2Serial}|RT_${data.connectingLegs.leg2Route}|${data.connectingLegs.leg2From}|${data.connectingLegs.leg2To}|INR_${cFare}|VALID`,
              fare: Math.ceil(cFare / 2),
              status: 'Valid',
            });
          }
        } else {
          for (let i = 0; i < adultC; i++) {
            const pSerial = `${ticketNum}-P${pIndex}`;
            individualQrs.push({
              passengerIndex: pIndex,
              passengerLabel: `Adult (${pIndex} of ${pCount})`,
              passengerType: data.paymentMode === 'Free Pink Pass' ? 'Pink Pass (Free)' : 'Adult',
              qrSerial: pSerial,
              qrCodeData: `DTC|${pSerial}|RT_${data.routeNumber}|${data.origin}|${data.destination}|FARE_${data.paymentMode === 'Free Pink Pass' ? 0 : aFare}|SEC_${Date.now()}_P${pIndex}`,
              fare: data.paymentMode === 'Free Pink Pass' ? 0 : aFare,
              status: 'Valid',
            });
            pIndex++;
          }

          for (let i = 0; i < childC; i++) {
            const pSerial = `${ticketNum}-P${pIndex}`;
            individualQrs.push({
              passengerIndex: pIndex,
              passengerLabel: `Child (${pIndex} of ${pCount})`,
              passengerType: 'Child',
              qrSerial: pSerial,
              qrCodeData: `DTC|${pSerial}|RT_${data.routeNumber}|${data.origin}|${data.destination}|FARE_${cFare}|SEC_${Date.now()}_P${pIndex}`,
              fare: cFare,
              status: 'Valid',
            });
            pIndex++;
          }
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const dateStr = now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const expiryDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const expiryTimeStr = expiryDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const bookedAtFormatted = timeStr;
        const validUntilFormatted = `${expiryTimeStr} (2h)`;

        const newTicket: PassengerTicket = {
          id: `tkt-${now.getTime()}`,
          ticketNumber: ticketNum,
          passengerName: profile.name,
          passengerPhone: profile.phone,
          phone: profile.phone,
          routeNumber: data.routeNumber,
          sourceStop: data.origin,
          boardingStop: data.origin,
          destinationStop: data.destination,
          busType: data.busType,
          fare: data.fare,
          passengersCount: pCount,
          totalAmount: data.totalAmount,
          bookedAt: bookedAtFormatted,
          validUntil: validUntilFormatted,
          bookedTimestamp: now.getTime(),
          expiryTimestamp: expiryDate.getTime(),
          qrCodeData: `DTC|${ticketNum}|${data.routeNumber}|${data.origin}|${data.destination}|${pCount}P|INR${data.totalAmount}|SEC_${now.getTime()}`,
          individualQrs,
          isConnecting: data.isConnecting,
          transferStop: data.transferStop,
          connectingLegs: data.connectingLegs,
          paymentMode: data.paymentMode || 'UPI',
          status: 'Valid',
        };

        // Deduct from wallet if wallet payment
        if (data.paymentMode === 'Wallet' && profile.walletBalance >= data.totalAmount) {
          set((state) => ({
            passengerProfile: {
              ...state.passengerProfile,
              walletBalance: state.passengerProfile.walletBalance - data.totalAmount,
            },
          }));
        }

        set((state) => ({
          passengerTickets: [newTicket, ...state.passengerTickets],
        }));

        return newTicket;
      },

      issueDtcPass: (data) => {
        const profile = get().passengerProfile;
        const count = get().passes.length + 80924;
        const passNum = `DTC-PASS-${count}`;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const todayStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const newPass: DtcPass = {
          id: `pass-${now.getTime()}`,
          passNumber: passNum,
          holderName: profile.name,
          holderPhone: profile.phone,
          passType: data.passType,
          cost: data.cost,
          issuedDate: `${todayStr}, ${timeStr}`,
          validUntil: `${todayStr}, 11:59 PM`,
          status: 'Active',
        };

        const pTicketNum = `DTC-PASS-TKT-${count}`;
        const passTicket: PassengerTicket = {
          id: `tkt-pass-${now.getTime()}`,
          ticketNumber: pTicketNum,
          passengerName: profile.name,
          passengerPhone: profile.phone,
          phone: profile.phone,
          routeNumber: 'ALL ROUTES',
          sourceStop: 'All Delhi NCR',
          boardingStop: 'All Delhi NCR',
          destinationStop: `Unlimited Travel (${data.passType})`,
          busType: data.passType.includes('AC') ? 'AC Electric' : 'Non-AC Standard',
          fare: data.cost,
          passengersCount: 1,
          totalAmount: data.cost,
          bookedAt: timeStr,
          validUntil: '11:59 PM (Today)',
          bookedTimestamp: now.getTime(),
          expiryTimestamp: endOfDay.getTime(),
          qrCodeData: `DTC|PASS|${passNum}|${data.passType}|${profile.name}|VALID_TODAY|${now.getTime()}`,
          paymentMode: data.paymentMode || 'UPI',
          individualQrs: [
            {
              passengerIndex: 1,
              passengerLabel: `Pass: ${data.passType}`,
              passengerType: 'Adult',
              qrSerial: `${passNum}-QR1`,
              qrCodeData: `DTC|PASS|${passNum}|${data.passType}|VALID_TODAY`,
              fare: data.cost,
              status: 'Valid',
            },
          ],
          status: 'Valid',
        };

        set((state) => ({
          passes: [newPass, ...state.passes],
          passengerTickets: [passTicket, ...state.passengerTickets],
        }));

        return newPass;
      },

      markTicketExpired: (ticketId) => {
        set((state) => ({
          passengerTickets: state.passengerTickets.map((t) =>
            t.id === ticketId || t.ticketNumber === ticketId
              ? {
                  ...t,
                  status: 'Expired' as const,
                  individualQrs: t.individualQrs?.map((q) => ({ ...q, status: 'Expired' as const })),
                }
              : t
          ),
        }));
      },

      markTicketUsed: (ticketId) => {
        set((state) => ({
          passengerTickets: state.passengerTickets.map((t) =>
            t.id === ticketId || t.ticketNumber === ticketId
              ? {
                  ...t,
                  status: 'Scanned & Used' as const,
                  individualQrs: t.individualQrs?.map((q) => ({ ...q, status: 'Scanned & Used' as const })),
                }
              : t
          ),
        }));
      },

      expirePass: (passId) => {
        set((state) => ({
          passes: state.passes.map((p) =>
            p.id === passId || p.passNumber === passId ? { ...p, status: 'Expired' as const } : p
          ),
          passengerTickets: state.passengerTickets.map((t) =>
            t.ticketNumber.includes(passId) || t.id.includes(passId)
              ? { ...t, status: 'Expired' as const }
              : t
          ),
        }));
      },

      issuePinkPass: (routeNumber) => {
        const profile = get().passengerProfile;
        const count = get().passengerTickets.length + 9422;
        const ticketNum = `DTC-PINK-2026-${count}`;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const todayStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const individualQrs: IndividualQrItem[] = [
          {
            passengerIndex: 1,
            passengerLabel: 'Passenger 1 of 1 (Pink Pass)',
            passengerType: 'Pink Pass (Free)',
            qrSerial: `${ticketNum}-P1`,
            qrCodeData: `DTC|PINK_FREE|${profile.name}|GNCTD_WOMEN_EMPOWERMENT|${now.getTime()}`,
            fare: 0,
            status: 'Valid',
          },
        ];

        const newTicket: PassengerTicket = {
          id: `tkt-pink-${now.getTime()}`,
          ticketNumber: ticketNum,
          passengerName: profile.name,
          passengerPhone: profile.phone,
          phone: profile.phone,
          routeNumber: routeNumber || 'All Delhi Routes',
          sourceStop: 'Delhi NCR Corridor',
          boardingStop: 'Delhi NCR Corridor',
          destinationStop: 'Delhi NCR Corridor',
          busType: 'Non-AC Standard',
          fare: 0,
          passengersCount: 1,
          totalAmount: 0,
          bookedAt: timeStr,
          validUntil: '11:59 PM (Today)',
          bookedTimestamp: now.getTime(),
          expiryTimestamp: endOfDay.getTime(),
          qrCodeData: `DTC|PINK_FREE|${profile.name}|GNCTD_WOMEN_EMPOWERMENT|${now.getTime()}`,
          individualQrs,
          paymentMode: 'Free Pink Pass',
          status: 'Valid',
        };

        set((state) => ({
          passengerTickets: [newTicket, ...state.passengerTickets],
        }));

        return newTicket;
      },

      topUpWallet: (amount) => {
        set((state) => ({
          passengerProfile: {
            ...state.passengerProfile,
            walletBalance: state.passengerProfile.walletBalance + amount,
          },
        }));
      },

      submitPassengerRefund: (ticketNumber, amount, reason) => {
        const profile = get().passengerProfile;
        const newRefund: RefundRequest = {
          id: `ref-${Date.now()}`,
          ticketNumber,
          passengerName: profile.name,
          phone: profile.phone,
          amount,
          reason,
          requestedAt: 'Just Now',
          status: 'Pending',
        };

        set((state) => ({
          refundRequests: [newRefund, ...state.refundRequests],
          passengerTickets: state.passengerTickets.map((t) =>
            t.ticketNumber === ticketNumber ? { ...t, status: 'Refunded' } : t
          ),
        }));
      },

      calculateFare: (busType, distanceKm) => {
        const slabs = get().fareSlabs.filter((s) => s.busCategory === busType);
        const match = slabs.find((s) => distanceKm >= s.minKm && distanceKm <= s.maxKm);
        if (match) return match.fare;
        if (busType === 'Non-AC Standard') return 15;
        return 25;
      },

      // Conductor ETIM Terminal State & Actions
      activeDutyId: 'cd-1',
      setActiveDutyId: (id) => set({ activeDutyId: id }),
      currentStopIndex: 2, // Default at Saket Crossing
      setCurrentStopIndex: (idx) => set({ currentStopIndex: idx }),
      advanceBusStop: () => {
        set((state) => {
          const duty = state.conductorDuties.find((d) => d.id === state.activeDutyId);
          const route = state.routes.find((r) => r.routeNumber === duty?.routeNumber);
          const maxIdx = (route?.stops.length || 1) - 1;
          return { currentStopIndex: Math.min(maxIdx, state.currentStopIndex + 1) };
        });
      },
      reverseBusStop: () => {
        set((state) => ({ currentStopIndex: Math.max(0, state.currentStopIndex - 1) }));
      },

      verifyPassengerQr: (qrString) => {
        const state = get();
        const activeDuty = state.conductorDuties.find((d) => d.id === state.activeDutyId) || state.conductorDuties[0];
        const trimmed = qrString.trim();
        const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        // Search for matching ticket
        const matchedTicket = state.passengerTickets.find((t) => {
          if (t.ticketNumber === trimmed || t.qrCodeData === trimmed) return true;
          if (trimmed.includes(t.ticketNumber)) return true;
          if (t.individualQrs?.some((q) => q.qrSerial === trimmed || q.qrCodeData === trimmed || trimmed.includes(q.qrSerial))) return true;
          return false;
        });

        if (!matchedTicket) {
          if (trimmed.startsWith('DTC|')) {
            const parts = trimmed.split('|');
            const routePart = parts.find((p) => p.startsWith('RT_'))?.replace('RT_', '') || parts[2] || '';
            if (routePart && routePart !== activeDuty.routeNumber) {
              return {
                success: false,
                status: 'INVALID_ROUTE',
                message: `Ticket issued for Route ${routePart}, but current bus is Route ${activeDuty.routeNumber}`,
                timestamp: now,
              };
            }
          }

          return {
            success: false,
            status: 'NOT_FOUND',
            message: 'Ticket not found in DTC central registry or invalid barcode format.',
            timestamp: now,
          };
        }

        // Validate Route (All-Route passes are valid on every bus route)
        if (
          matchedTicket.routeNumber &&
          activeDuty.routeNumber &&
          matchedTicket.routeNumber !== 'ALL ROUTES' &&
          !matchedTicket.routeNumber.includes('ALL') &&
          matchedTicket.routeNumber !== activeDuty.routeNumber
        ) {
          return {
            success: false,
            status: 'INVALID_ROUTE',
            ticket: matchedTicket,
            message: `Route Mismatch! Ticket is for Route ${matchedTicket.routeNumber}, but this bus is Route ${activeDuty.routeNumber}.`,
            timestamp: now,
          };
        }

        // Find individual QR item
        let matchedQr = matchedTicket.individualQrs?.find(
          (q) => q.qrSerial === trimmed || q.qrCodeData === trimmed || trimmed.includes(q.qrSerial)
        );

        if (!matchedQr && matchedTicket.individualQrs && matchedTicket.individualQrs.length > 0) {
          matchedQr = matchedTicket.individualQrs.find((q) => q.status === 'Valid') || matchedTicket.individualQrs[0];
        }

        // Check if expired
        if (matchedQr?.status === 'Expired' || matchedTicket.status === 'Expired') {
          return {
            success: false,
            status: 'EXPIRED',
            ticket: matchedTicket,
            qrItem: matchedQr,
            message: `TICKET EXPIRED! QR code (${matchedQr?.qrSerial || matchedTicket.ticketNumber}) has expired and is INVALID. Cannot be reused.`,
            timestamp: now,
          };
        }

        // Check if already used
        if (matchedQr?.status === 'Scanned & Used' || matchedTicket.status === 'Scanned & Used') {
          return {
            success: false,
            status: 'ALREADY_USED',
            ticket: matchedTicket,
            qrItem: matchedQr,
            message: `FRAUD DETECTED! QR code (${matchedQr?.qrSerial || matchedTicket.ticketNumber}) was ALREADY scanned & used previously.`,
            timestamp: now,
          };
        }

        // Mark individual QR and ticket as scanned
        set((s) => ({
          passengerTickets: s.passengerTickets.map((t) => {
            if (t.id === matchedTicket.id) {
              const updatedIndividualQrs = t.individualQrs?.map((q) =>
                matchedQr && q.qrSerial === matchedQr.qrSerial ? { ...q, status: 'Scanned & Used' as const } : q
              );
              const allUsed = updatedIndividualQrs ? updatedIndividualQrs.every((q) => q.status === 'Scanned & Used') : true;
              return {
                ...t,
                individualQrs: updatedIndividualQrs,
                status: allUsed ? ('Scanned & Used' as const) : t.status,
              };
            }
            return t;
          }),
          conductorDuties: s.conductorDuties.map((d) =>
            d.id === activeDuty.id
              ? { ...d, ticketsSoldDigital: d.ticketsSoldDigital + 1 }
              : d
          ),
        }));

        return {
          success: true,
          status: 'VALID',
          ticket: matchedTicket,
          qrItem: matchedQr,
          message: `Ticket Verified! ${matchedQr?.passengerLabel || '1 Commuter'} authorized to board.`,
          timestamp: now,
        };
      },

      issueEtimTicket: (data) => {
        const state = get();
        const activeDuty = state.conductorDuties.find((d) => d.id === state.activeDutyId) || state.conductorDuties[0];
        const count = state.passengerTickets.length + 9450;
        const ticketNum = `DTC-ETIM-2026-${count}`;
        const isPink = data.passengerType === 'Pink Pass (Free)';
        const fare = isPink ? 0 : data.fare;
        const total = fare * data.count;

        const individualQrs: IndividualQrItem[] = Array.from({ length: data.count }, (_, idx) => ({
          passengerIndex: idx + 1,
          passengerLabel: `Passenger ${idx + 1} of ${data.count}`,
          passengerType: isPink ? 'Pink Pass (Free)' : 'Adult',
          qrSerial: `${ticketNum}-P${idx + 1}`,
          qrCodeData: `DTC|${ticketNum}-P${idx + 1}|${data.routeNumber}|${data.origin}|${data.destination}|CASH_ETIM|${Date.now()}`,
          fare,
          status: 'Scanned & Used',
        }));

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const todayStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const bookedAtFormatted = `Today (${todayStr}), ${timeStr}`;

        const newTicket: PassengerTicket = {
          id: `etim-${Date.now()}`,
          ticketNumber: ticketNum,
          passengerName: isPink ? 'Female Commuter (Pink Pass)' : 'Cash Passenger',
          passengerPhone: 'Cash Commuter',
          phone: 'Cash Commuter',
          routeNumber: data.routeNumber,
          sourceStop: data.origin,
          boardingStop: data.origin,
          destinationStop: data.destination,
          busType: data.busType,
          fare,
          passengersCount: data.count,
          totalAmount: total,
          bookedAt: bookedAtFormatted,
          validUntil: 'Current Trip Only',
          qrCodeData: `DTC|${ticketNum}|${data.routeNumber}|CASH|PAID`,
          individualQrs,
          paymentMode: isPink ? 'Free Pink Pass' : 'Cash (ETIM)',
          status: 'Scanned & Used',
        };

        set((s) => ({
          passengerTickets: [newTicket, ...s.passengerTickets],
          conductorDuties: s.conductorDuties.map((d) =>
            d.id === activeDuty.id
              ? {
                  ...d,
                  ticketsSoldCash: isPink ? d.ticketsSoldCash : d.ticketsSoldCash + data.count,
                  pinkTicketsIssued: isPink ? d.pinkTicketsIssued + data.count : d.pinkTicketsIssued,
                  totalCashCollected: d.totalCashCollected + total,
                }
              : d
          ),
        }));

        return newTicket;
      },

      issueConductorChallan: (data) => {
        const state = get();
        const activeDuty = state.conductorDuties.find((d) => d.id === state.activeDutyId) || state.conductorDuties[0];
        const count = state.noTicketChallans.length + 1050;
        const total = data.fineAmount + data.fareDue;
        const newChallan: NoTicketChallan = {
          id: `ch-${Date.now()}`,
          challanNumber: `DTC-CH-2026-${count}`,
          passengerName: data.violatorName,
          passengerPhone: data.violatorPhone,
          gender: data.gender || 'Male',
          routeNumber: activeDuty.routeNumber,
          busNumber: activeDuty.busNumber,
          locationStop: data.stopName,
          conductorName: activeDuty.conductorName,
          conductorBadge: activeDuty.badgeNumber,
          penaltyAmount: data.fineAmount,
          fareDue: data.fareDue,
          totalAmount: total,
          notes: data.violationReason,
          status: data.paymentMode === 'Pending' ? 'Pending Payment' : 'Paid on Spot',
          paymentMode: data.paymentMode,
          issuedAt: 'Just Now',
        };

        set((s) => ({
          noTicketChallans: [newChallan, ...s.noTicketChallans],
          conductorDuties: s.conductorDuties.map((d) =>
            d.id === activeDuty.id && data.paymentMode === 'Cash'
              ? { ...d, totalCashCollected: d.totalCashCollected + total }
              : d
          ),
        }));

        return newChallan;
      },
    }),
    {
      name: 'dtc-sanchalan-storage',
      version: 3,
      migrate: (persistedState, fromVersion) => {
        // Always reset to fresh initialRoutes and initialLiveBuses on version change
        const old = (persistedState ?? {}) as Record<string, unknown>;
        return {
          noTicketChallans: (old.noTicketChallans as NoTicketChallan[]) ?? initialNoTicketChallans,
          invalidTicketViolations: (old.invalidTicketViolations as InvalidTicketViolation[]) ?? initialInvalidTickets,
          notices: (old.notices as DtcNotice[]) ?? initialNotices,
          conductorDuties: (old.conductorDuties as ConductorDuty[]) ?? initialDuties,
          conductorAttendances: (old.conductorAttendances as ConductorAttendance[]) ?? initialAttendances,
          shiftHandovers: (old.shiftHandovers as ShiftHandover[]) ?? initialHandovers,
          passengerTickets: (old.passengerTickets as PassengerTicket[]) ?? initialTickets,
          passes: (old.passes as DtcPass[]) ?? initialPasses,
          refundRequests: (old.refundRequests as RefundRequest[]) ?? initialRefunds,
          supportTickets: (old.supportTickets as SupportTicket[]) ?? initialSupportTickets,
          passengerProfile: (old.passengerProfile as PassengerProfile) ?? initialPassengerProfile,
        };
      },
      partialize: (state) => ({
        // Only persist user-generated data — NOT static route/bus/fare data
        noTicketChallans: state.noTicketChallans,
        invalidTicketViolations: state.invalidTicketViolations,
        notices: state.notices,
        conductorDuties: state.conductorDuties,
        conductorAttendances: state.conductorAttendances,
        shiftHandovers: state.shiftHandovers,
        passengerTickets: state.passengerTickets,
        passes: state.passes,
        refundRequests: state.refundRequests,
        supportTickets: state.supportTickets,
        passengerProfile: state.passengerProfile,
      }),
    }
  )
);
