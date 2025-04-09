import fetch from "node-fetch";

/**
 * Geocode an address to get coordinates using Nominatim (OpenStreetMap) API directly
 * @param address The address to geocode
 * @returns Promise with latitude and longitude or null if geocoding fails
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Use Nominatim API directly
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "PickleballCourtFinder/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Geocoding request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    console.log("No geocoding results found for address:", address);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
