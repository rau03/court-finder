import fetch from "node-fetch";

/**
 * Geocode an address to get coordinates using Google Maps Geocoding API
 * @param address The address to geocode
 * @returns Promise with latitude and longitude or null if geocoding fails
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    // Add components parameter to bias results to the United States
    // This helps prioritize US locations over international ones
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&components=country:US&key=${apiKey}`;

    console.log("Attempting to geocode address:", address);

    const response = await fetch(url);
    const data = await response.json();

    console.log("Geocoding API response status:", data.status);

    if (data.error_message) {
      console.error("Geocoding API error:", data.error_message);
      throw new Error(data.error_message);
    }

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;

      // Log the full result for debugging
      console.log("Successfully geocoded to:", location);
      console.log("Full address:", data.results[0].formatted_address);

      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    // Log more detailed information about why geocoding failed
    if (data.status !== "OK") {
      console.error("Geocoding failed with status:", data.status);
      switch (data.status) {
        case "ZERO_RESULTS":
          throw new Error("No locations found for this address");
        case "OVER_QUERY_LIMIT":
          throw new Error("Geocoding quota exceeded");
        case "REQUEST_DENIED":
          throw new Error(
            "Geocoding request denied - check API key configuration"
          );
        case "INVALID_REQUEST":
          throw new Error("Invalid geocoding request");
        default:
          throw new Error(`Geocoding failed: ${data.status}`);
      }
    }

    console.log("No geocoding results found for address:", address);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
}

/**
 * Fallback geocoding method using Nominatim (OpenStreetMap) which doesn't require an API key
 */
async function fallbackGeocoding(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    console.log("Trying fallback geocoding with Nominatim for:", address);

    // Use Nominatim as a fallback (OpenStreetMap's geocoder)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;

    const response = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent header
        "User-Agent": "CourtFinder/1.0",
      },
    });

    const data = await response.json();

    if (data && data.length > 0) {
      console.log("Successfully geocoded with fallback method:", data[0]);
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    console.log("Fallback geocoding failed to find results");
    return null;
  } catch (error) {
    console.error("Fallback geocoding error:", error);
    return null;
  }
}

// Helper function to extract address components from a geocoded result
export async function getAddressComponents(address: string): Promise<{
  city: string;
  state: string;
  zipCode: string;
}> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&components=country:US&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return { city: "", state: "", zipCode: "" };
    }

    const result = data.results[0];
    const components = result.address_components;

    let city = "";
    let state = "";
    let zipCode = "";

    // Extract city, state, and zip
    for (const component of components) {
      if (component.types.includes("locality")) {
        city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        state = component.short_name; // Use the abbreviated state code
      } else if (component.types.includes("postal_code")) {
        zipCode = component.long_name;
      }
    }

    return { city, state, zipCode };
  } catch (error) {
    console.error("Error extracting address components:", error);
    return { city: "", state: "", zipCode: "" };
  }
}
