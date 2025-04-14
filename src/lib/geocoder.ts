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

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Geocoding request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    console.log("No geocoding results found for address:", address);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
