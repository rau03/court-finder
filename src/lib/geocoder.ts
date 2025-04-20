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
      console.warn(
        "Google Maps API key is not configured, using fallback geocoder"
      );
      return fallbackGeocoding(address);
    }

    console.log("Attempting to geocode address:", address);

    // Make sure address includes "USA" for better results
    let searchAddress = address;
    if (
      !searchAddress.toLowerCase().includes("usa") &&
      !searchAddress.toLowerCase().includes("united states")
    ) {
      searchAddress = `${searchAddress}, USA`;
    }

    // Add components parameter to bias results to the United States
    // This helps prioritize US locations over international ones
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      searchAddress
    )}&components=country:US&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("Geocoding API response status:", data.status);

    if (data.error_message) {
      console.error("Geocoding API error:", data.error_message);
      console.warn("Falling back to Nominatim geocoder");
      return fallbackGeocoding(address);
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

    // Try again without the components parameter if no results found
    if (data.status === "ZERO_RESULTS") {
      console.log(
        "No results with US component restriction, trying without restriction"
      );
      const unrestricted_url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        searchAddress
      )}&key=${apiKey}`;

      const retry_response = await fetch(unrestricted_url);
      const retry_data = await retry_response.json();

      if (
        retry_data.status === "OK" &&
        retry_data.results &&
        retry_data.results.length > 0
      ) {
        const location = retry_data.results[0].geometry.location;
        console.log("Successfully geocoded without restriction to:", location);
        console.log("Full address:", retry_data.results[0].formatted_address);

        return {
          lat: location.lat,
          lng: location.lng,
        };
      }
    }

    // Log more detailed information about why geocoding failed
    if (data.status !== "OK") {
      console.error("Geocoding failed with status:", data.status);
      // For any failed status, try the fallback instead of throwing an error
      console.warn("Using fallback geocoder due to Google Maps API issue");
      return fallbackGeocoding(address);
    }

    console.log("No geocoding results found for address:", address);
    return fallbackGeocoding(address);
  } catch (error) {
    console.error("Geocoding error:", error);
    console.warn("Attempting to use fallback geocoder after error");
    return fallbackGeocoding(address);
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

    // Make sure address includes "USA" for better results in the US
    let searchAddress = address;
    if (
      !searchAddress.toLowerCase().includes("usa") &&
      !searchAddress.toLowerCase().includes("united states")
    ) {
      searchAddress = `${searchAddress}, USA`;
    }

    // Use Nominatim as a fallback (OpenStreetMap's geocoder)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchAddress
    )}&countrycodes=us`; // Limit to US

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

    // Try without country restriction if no results
    if (data.length === 0) {
      console.log(
        "No results with US restriction, trying without country code"
      );
      const unrestricted_url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchAddress
      )}`;

      const retry_response = await fetch(unrestricted_url, {
        headers: {
          "User-Agent": "CourtFinder/1.0",
        },
      });

      const retry_data = await retry_response.json();

      if (retry_data && retry_data.length > 0) {
        console.log(
          "Successfully geocoded without country restriction:",
          retry_data[0]
        );
        return {
          lat: parseFloat(retry_data[0].lat),
          lng: parseFloat(retry_data[0].lon),
        };
      }
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
      console.warn("Google Maps API key is not configured");
      return { city: "", state: "", zipCode: "" };
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
