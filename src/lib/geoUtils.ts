// Delhi DTC Geo Utilities for Passenger Distance & Walking Calculation
import { NearestStopInfo } from '@/types/dtc';

export interface StopCoordinates {
  name?: string;
  lat: number;
  lng: number;
  landmark: string;
}

// Master Delhi Coordinates for DTC Bus Stops
export const DTC_STOP_COORDINATES: Record<string, StopCoordinates> = {
  'Mehrauli Terminal': { lat: 28.5175, lng: 77.1836, landmark: 'Near Qutub Minar Complex' },
  'Qutub Minar Metro': { lat: 28.5133, lng: 77.1858, landmark: 'Yellow Line Metro Station Gate 1' },
  'Saket Crossing': { lat: 28.5245, lng: 77.2066, landmark: 'Opposite Select Citywalk / MB Road' },
  'Hauz Khas': { lat: 28.5494, lng: 77.2001, landmark: 'Outer Ring Road Interchange' },
  'AIIMS / Safdarjung': { lat: 28.5672, lng: 77.2100, landmark: 'Near AIIMS Emergency Gate, Sri Aurobindo Marg' },
  'INA Colony': { lat: 28.5744, lng: 77.2100, landmark: 'Opposite Dilli Haat / INA Metro Gate 2' },
  'Janpath / CP': { lat: 28.6219, lng: 77.2183, landmark: 'Janpath Market / Tolstoy Marg' },
  'New Delhi Rly Station': { lat: 28.6430, lng: 77.2197, landmark: 'Ajmeri Gate Side Terminal' },
  'Red Fort': { lat: 28.6562, lng: 77.2410, landmark: 'Opposite Chandni Chowk / Red Fort' },
  'Kashmere Gate ISBT': { lat: 28.6675, lng: 77.2285, landmark: 'Inter-State Bus Terminal Gate 3' },
  'Kapashera Border': { lat: 28.5120, lng: 77.0855, landmark: 'Delhi-Gurugram Border Checkpost' },
  'Samalka': { lat: 28.5280, lng: 77.1020, landmark: 'Near Shiv Murti / NH-48' },
  'Mahipalpur': { lat: 28.5432, lng: 77.1264, landmark: 'Mahipalpur Bypass / Aerocity Road' },
  'Dhaula Kuan': { lat: 28.5921, lng: 77.1616, landmark: 'Dhaula Kuan Interchange / Ring Road' },
  'Karol Bagh Metro': { lat: 28.6445, lng: 77.1887, landmark: 'Pusa Road, Blue Line Metro' },
  'Mori Gate Terminal': { lat: 28.6650, lng: 77.2150, landmark: 'Old Delhi Mori Gate' },
  'Wazirpur Depot': { lat: 28.6980, lng: 77.1650, landmark: 'DTC Depot Wazirpur Ring Road' },
  'Rohini Sector 7': { lat: 28.7120, lng: 77.1180, landmark: 'Near Naharpur Village / Metro' },
  'Peeragarhi Crossing': { lat: 28.6780, lng: 77.0930, landmark: 'Rohtak Road Junction' },
  'Janakpuri District Centre': { lat: 28.6280, lng: 77.0810, landmark: 'Major District Commercial Hub' },
  'Nehru Place Terminal': { lat: 28.5490, lng: 77.2530, landmark: 'Nehru Place Computer Market Bus Bay' },
  'Sarai Kale Khan ISBT': { lat: 28.5910, lng: 77.2580, landmark: 'Near Hazrat Nizamuddin Rly Station' },
  'JNU Old Campus': { lat: 28.5400, lng: 77.1660, landmark: 'Jawaharlal Nehru University Main Gate' },
  'Munirka': { lat: 28.5570, lng: 77.1730, landmark: 'Munirka Flyover / Metro Gate 3' },
  'RK Puram Sec 1': { lat: 28.5670, lng: 77.1780, landmark: 'Near Africa Avenue' },
  'Safdarjung Hospital': { lat: 28.5680, lng: 77.2070, landmark: 'Ring Road OPD Gate' },
  'Connaught Place Super Bazar': { lat: 28.6310, lng: 77.2190, landmark: 'Outer Circle CP' },
  'Minto Road Terminal': { lat: 28.6370, lng: 77.2260, landmark: 'Minto Bridge / DDU Marg' },
  'Ambedkar Nagar Terminal': { lat: 28.5180, lng: 77.2340, landmark: 'BRT Corridor Terminal' },
  'Pushp Vihar': { lat: 28.5280, lng: 77.2240, landmark: 'Sector 4 Pushp Vihar Bus Shelter' },
  'Chirag Delhi': { lat: 28.5400, lng: 77.2260, landmark: 'Chirag Delhi Flyover Crossing' },
  'Moolchand Hospital': { lat: 28.5670, lng: 77.2360, landmark: 'Ring Road Moolchand Flyover' },
  'Lajpat Nagar': { lat: 28.5695, lng: 77.2435, landmark: 'Lajpat Nagar Metro Station / Central Market' },
  'Ashram Chowk': { lat: 28.5820, lng: 77.2510, landmark: 'Ring Road Ashram Crossing' },
  'Delhi Gate': { lat: 28.6400, lng: 77.2410, landmark: 'Near Feroz Shah Kotla Stadium' },
  'Old Delhi Railway Station': { lat: 28.6580, lng: 77.2300, landmark: 'Chandni Chowk / Dufferin Bridge' },
};

// Realistic Delhi Commuter Preset Locations (for testing or when off-bus-stop)
export interface CommuterLocationPreset {
  id: string;
  label: string;
  area: string;
  lat: number;
  lng: number;
}

export const COMMUTER_LOCATION_PRESETS: CommuterLocationPreset[] = [
  {
    id: 'ina-market',
    label: 'Dilli Haat / Kidwai Nagar',
    area: 'South Delhi',
    lat: 28.5718,
    lng: 77.2085,
  },
  {
    id: 'saket-mall',
    label: 'Select Citywalk Mall, Saket',
    area: 'Saket District',
    lat: 28.5282,
    lng: 77.2185,
  },
  {
    id: 'aiims-campus',
    label: 'AIIMS Main Hospital Gate',
    area: 'Ansari Nagar',
    lat: 28.5660,
    lng: 77.2120,
  },
  {
    id: 'aerocity-hotel',
    label: 'Worldmark Aerocity Hotel Hub',
    area: 'Near Airport',
    lat: 28.5490,
    lng: 77.1210,
  },
  {
    id: 'cp-inner',
    label: 'Connaught Place Inner Circle',
    area: 'Central Delhi',
    lat: 28.6328,
    lng: 77.2195,
  },
];

// Haversine formula to compute distance in meters between two lat/lng points
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Format meters to human readable string (e.g. "320 m" or "1.4 km")
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Calculate approximate walking time in minutes (assuming ~80 meters per minute / 4.8 km/h)
export function calculateWalkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 80));
}

// Find sorted nearest bus stops from current user coordinates
export function findNearestStops(
  userLat: number,
  userLng: number,
  limit: number = 3
): NearestStopInfo[] {
  const stopsList: NearestStopInfo[] = [];

  Object.entries(DTC_STOP_COORDINATES).forEach(([stopName, coords]) => {
    const distMeters = calculateHaversineDistanceMeters(userLat, userLng, coords.lat, coords.lng);
    const walkMins = calculateWalkingMinutes(distMeters);

    stopsList.push({
      name: stopName,
      distanceMeters: distMeters,
      distanceFormatted: formatDistance(distMeters),
      walkingTimeMinutes: walkMins,
      walkingAdvice: `Walk ${formatDistance(distMeters)} towards ${coords.landmark} (~${walkMins} mins walk)`,
      landmark: coords.landmark,
      lat: coords.lat,
      lng: coords.lng,
    });
  });

  // Sort ascending by distance in meters
  stopsList.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return stopsList.slice(0, limit);
}
