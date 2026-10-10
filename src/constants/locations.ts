// District and Farm GPS coordinates for live GPS delivery routing across Qatar
export interface LatLng {
  lat: number;
  lng: number;
}

export const CENTRAL_FARM_HUB: LatLng = {
  lat: 25.4052, // NasBaladna Agricultural Complex / Al Khor Agri Zone
  lng: 51.4883,
};

export const QATAR_DISTRICT_COORDINATES: Record<string, LatLng> = {
  'West Bay, Doha': { lat: 25.3216, lng: 51.5312 },
  'The Pearl-Qatar': { lat: 25.3713, lng: 51.5517 },
  'Lusail City': { lat: 25.4199, lng: 51.5173 },
  'Al Waab, Doha': { lat: 25.2635, lng: 51.4647 },
  'Al Sadd, Doha': { lat: 25.2867, lng: 51.5036 },
  'Al Dafna, Doha': { lat: 25.3341, lng: 51.5244 },
  'Al Rayyan': { lat: 25.2919, lng: 51.4244 },
  'Al Wakrah': { lat: 25.1768, lng: 51.6034 },
  'Madinat Khalifa': { lat: 25.3188, lng: 51.4839 },
  'Abu Hamour': { lat: 25.2341, lng: 51.4795 },
  'Al Hilal & Airport': { lat: 25.2577, lng: 51.5458 },
  'Duhail / Qatar University': { lat: 25.3688, lng: 51.4776 },
};

export function getDistrictCoordinates(districtName: string): LatLng {
  return QATAR_DISTRICT_COORDINATES[districtName] || { lat: 25.2854, lng: 51.5310 }; // Default Doha center
}

// Calculate interpolated position along path from farm to destination
export function interpolatePosition(start: LatLng, end: LatLng, fraction: number): LatLng {
  const clamped = Math.max(0, Math.min(1, fraction));
  return {
    lat: start.lat + (end.lat - start.lat) * clamped,
    lng: start.lng + (end.lng - start.lng) * clamped,
  };
}
