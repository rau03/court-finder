interface Location {
  coordinates: number[];
}

interface LocationObject {
  location: Location;
}

export function areLocationsNearby(
  loc1: LocationObject,
  loc2: LocationObject,
  maxDistanceKm: number = 0.05
): boolean {
  const [lng1, lat1] = loc1.location.coordinates;
  const [lng2, lat2] = loc2.location.coordinates;

  // Convert latitude and longitude to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lng1Rad = (lng1 * Math.PI) / 180;
  const lng2Rad = (lng2 * Math.PI) / 180;

  // Haversine formula
  const dLat = lat2Rad - lat1Rad;
  const dLng = lng2Rad - lng1Rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Earth's radius in kilometers
  const R = 6371;
  const distance = R * c;

  return distance <= maxDistanceKm;
}
