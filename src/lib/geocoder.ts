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
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    // Use Google Maps Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

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
      console.log("Successfully geocoded to:", location);
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
    throw error; // Propagate the error up
  }
}
