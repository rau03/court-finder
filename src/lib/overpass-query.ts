export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export function createOptimizedQuery(bounds: Bounds): string {
  return `
    [out:json][timeout:60];
    (
      // Direct pickleball court matches
      node["sport"="pickleball"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["sport"="pickleball"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      
      // Places with pickleball in name or description
      node["name"~"pickleball",i](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["name"~"pickleball",i](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["description"~"pickleball",i](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["description"~"pickleball",i](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      
      // Sports facilities that might have pickleball
      node["leisure"="sports_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="sports_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["leisure"="pitch"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="pitch"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["leisure"="fitness_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="fitness_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      
      // Community centers and parks that might have courts
      node["amenity"="community_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["amenity"="community_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["leisure"="park"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="park"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      
      // Get the nodes that make up the ways
      >;
    );
    out body;
    >;
    out skel qt;
  `;
}

export function calculateBounds(
  lat: number,
  lng: number,
  radiusKm: number
): Bounds {
  // Validate inputs
  if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
    throw new Error("Invalid coordinates or radius");
  }
  if (lat < -90 || lat > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }
  if (lng < -180 || lng > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }
  if (radiusKm <= 0) {
    throw new Error("Radius must be greater than 0");
  }

  const latDelta = radiusKm / 111.32; // 111.32 km per degree of latitude
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lng - lngDelta,
    maxLon: lng + lngDelta,
  };
}
