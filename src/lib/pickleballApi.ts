/**
 * Client for the Pickleball.com API
 * Documentation: https://apidoc.pickleball.com/
 */

// Types for Pickleball API responses
export interface PickleballCourt {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  indoor: boolean;
  numberOfCourts?: number;
  amenities?: Record<string, unknown>;
  website?: string;
  phoneNumber?: string;
  // Add other fields as they become available in the API documentation
}

interface PickleballApiResponse {
  courts: PickleballCourt[];
  count: number;
  page: number;
  totalPages: number;
}

/**
 * Search for courts using the Pickleball.com API
 */
export async function searchPickleballCourts(params: {
  latitude?: number;
  longitude?: number;
  address?: string;
  state?: string;
  zipCode?: string;
  indoor?: boolean;
  maxDistance?: number;
}): Promise<PickleballCourt[]> {
  const {
    latitude,
    longitude,
    address,
    state,
    zipCode,
    indoor,
    maxDistance = 50000,
  } = params;

  // Verify we have API key
  const apiKey = process.env.PICKLEBALL_API_KEY;
  if (!apiKey) {
    console.warn("Pickleball API key is not configured");
    return [];
  }

  try {
    // Build search parameters
    const searchParams = new URLSearchParams();

    // Use coordinates if available, otherwise pass address for the API to geocode
    if (latitude && longitude) {
      searchParams.append("latitude", latitude.toString());
      searchParams.append("longitude", longitude.toString());
      searchParams.append("radius", (maxDistance / 1000).toString()); // Convert meters to km
    } else if (address) {
      searchParams.append("address", address);
    }

    if (state) searchParams.append("state", state);
    if (zipCode) searchParams.append("postalCode", zipCode);
    if (indoor !== undefined) searchParams.append("indoor", indoor.toString());

    // API endpoint (actual endpoint might be different - check API documentation)
    const url = `https://api.pickleball.com/v1/courts?${searchParams.toString()}`;

    console.log(`Calling Pickleball API: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pickleball API error (${response.status}): ${errorText}`);
      return [];
    }

    const data = (await response.json()) as PickleballApiResponse;
    console.log(`Found ${data.courts.length} courts from Pickleball API`);

    return data.courts;
  } catch (error) {
    console.error("Error fetching from Pickleball API:", error);
    return [];
  }
}

/**
 * Convert Pickleball API court format to our application's court format
 */
export function convertPickleballApiCourt(apiCourt: PickleballCourt) {
  return {
    _id: `pickleball_api_${apiCourt.id}`, // Use prefix to avoid ID collisions
    name: apiCourt.name,
    address: `${apiCourt.address.street}, ${apiCourt.address.city}, ${apiCourt.address.state} ${apiCourt.address.postalCode}`,
    city: apiCourt.address.city,
    state: apiCourt.address.state,
    zipCode: apiCourt.address.postalCode,
    indoor: apiCourt.indoor,
    numberOfCourts: apiCourt.numberOfCourts || 1,
    location: {
      type: "Point",
      coordinates: [apiCourt.location.longitude, apiCourt.location.latitude],
    },
    amenities: apiCourt.amenities || {
      indoorCourts: apiCourt.indoor,
      outdoorCourts: !apiCourt.indoor,
      lightsAvailable: false,
      restroomsAvailable: false,
      waterFountain: false,
    },
    contact: {
      website: apiCourt.website || "",
      phone: apiCourt.phoneNumber || "",
      email: "",
    },
    isVerified: true, // Since it's from an official API
    addedByUser: false,
    source: "pickleball_api", // Track the source for future reference
  };
}
