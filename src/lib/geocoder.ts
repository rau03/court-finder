import fetch from "node-fetch";
import { setTimeout } from "timers/promises";

// Simple implementation of a rate limiter
const rateLimiter = {
  lastCallTime: 0,
  minTimeBetweenCalls: 1000, // 1 second between calls for Nominatim

  async throttle() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < this.minTimeBetweenCalls) {
      // Wait for the remaining time
      const waitTime = this.minTimeBetweenCalls - timeSinceLastCall;
      await setTimeout(waitTime);
    }

    this.lastCallTime = Date.now();
  },
};

// Environment detection
const isProduction = process.env.NODE_ENV === "production";

/**
 * Safely log information based on environment
 * @param message The message to log
 * @param data Optional data to log in development only
 */
function safeLog(message: string, data?: any) {
  if (isProduction) {
    // In production, don't log sensitive data
    console.log(message);
  } else {
    // In development, we can log more details
    console.log(message, data || "");
  }
}

/**
 * Safely log errors based on environment
 * @param message The error message
 * @param error The error object
 */
function safeErrorLog(message: string, error?: any) {
  if (isProduction) {
    // In production, don't log potentially sensitive error details
    console.error(message);
  } else {
    // In development, we can log full error details
    console.error(message, error || "");
  }
}

/**
 * Validate address string to prevent injection and invalid input
 * @param address The address to validate
 * @returns The sanitized address or null if invalid
 */
function validateAddress(address: string): string | null {
  if (!address || typeof address !== "string") {
    return null;
  }

  // Basic sanitization - remove potentially harmful characters
  const sanitized = address.trim().replace(/[<>]/g, "");

  // Ensure minimum valid length
  if (sanitized.length < 3) {
    return null;
  }

  return sanitized;
}

/**
 * Geocode an address to get coordinates using Google Maps Geocoding API
 * @param address The address to geocode
 * @returns Promise with latitude and longitude or null if geocoding fails
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  // Validate input
  const validatedAddress = validateAddress(address);
  if (!validatedAddress) {
    safeErrorLog("Invalid address provided for geocoding");
    return null;
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      safeLog("Google Maps API key is not configured, using fallback geocoder");
      return fallbackGeocoding(validatedAddress);
    }

    safeLog("Attempting to geocode address");

    // Make sure address includes "USA" for better results
    let searchAddress = validatedAddress;
    if (
      !searchAddress.toLowerCase().includes("usa") &&
      !searchAddress.toLowerCase().includes("united states")
    ) {
      searchAddress = `${searchAddress}, USA`;
    }

    // Add components parameter to bias results to the United States
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      searchAddress
    )}&components=country:US&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    safeLog("Geocoding API response status:", data.status);

    if (data.error_message) {
      safeErrorLog(
        "Geocoding API error",
        isProduction ? null : data.error_message
      );
      safeLog("Falling back to Nominatim geocoder");
      return fallbackGeocoding(validatedAddress);
    }

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;

      // Avoid logging sensitive address information in production
      if (!isProduction) {
        console.log("Successfully geocoded to:", location);
        console.log("Full address:", data.results[0].formatted_address);
      } else {
        safeLog("Geocoding successful");
      }

      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    // Try again without the components parameter if no results found
    if (data.status === "ZERO_RESULTS") {
      safeLog(
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

        // Avoid logging sensitive address information in production
        if (!isProduction) {
          console.log(
            "Successfully geocoded without restriction to:",
            location
          );
          console.log("Full address:", retry_data.results[0].formatted_address);
        } else {
          safeLog("Geocoding successful without restriction");
        }

        return {
          lat: location.lat,
          lng: location.lng,
        };
      }
    }

    // Log more detailed information about why geocoding failed
    if (data.status !== "OK") {
      safeErrorLog("Geocoding failed with status:", data.status);
      // For any failed status, try the fallback instead of throwing an error
      safeLog("Using fallback geocoder due to Google Maps API issue");
      return fallbackGeocoding(validatedAddress);
    }

    safeLog("No geocoding results found");
    return fallbackGeocoding(validatedAddress);
  } catch (error) {
    safeErrorLog("Geocoding error", error);
    safeLog("Attempting to use fallback geocoder after error");
    return fallbackGeocoding(validatedAddress);
  }
}

/**
 * Fallback geocoding method using Nominatim (OpenStreetMap) which doesn't require an API key
 */
async function fallbackGeocoding(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Apply rate limiting before making request to Nominatim
    await rateLimiter.throttle();

    safeLog("Trying fallback geocoding with Nominatim");

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
        // Add referrer header for better compliance with Nominatim ToS
        Referer: process.env.NEXT_PUBLIC_APP_URL || "https://courtfinder.app",
      },
    });

    const data = await response.json();

    if (data && data.length > 0) {
      // Don't log actual address details in production
      if (!isProduction) {
        console.log("Successfully geocoded with fallback method:", data[0]);
      } else {
        safeLog("Fallback geocoding successful");
      }

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    // Try without country restriction if no results
    if (data.length === 0) {
      // Apply rate limiting again before making a second request
      await rateLimiter.throttle();

      safeLog("No results with US restriction, trying without country code");
      const unrestricted_url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchAddress
      )}`;

      const retry_response = await fetch(unrestricted_url, {
        headers: {
          "User-Agent": "CourtFinder/1.0",
          Referer: process.env.NEXT_PUBLIC_APP_URL || "https://courtfinder.app",
        },
      });

      const retry_data = await retry_response.json();

      if (retry_data && retry_data.length > 0) {
        // Don't log actual address details in production
        if (!isProduction) {
          console.log(
            "Successfully geocoded without country restriction:",
            retry_data[0]
          );
        } else {
          safeLog("Fallback geocoding successful without restrictions");
        }

        return {
          lat: parseFloat(retry_data[0].lat),
          lng: parseFloat(retry_data[0].lon),
        };
      }
    }

    safeLog("Fallback geocoding failed to find results");
    return null;
  } catch (error) {
    safeErrorLog("Fallback geocoding error", error);
    return null;
  }
}

// Helper function to extract address components from a geocoded result
export async function getAddressComponents(address: string): Promise<{
  city: string;
  state: string;
  zipCode: string;
}> {
  // Validate input
  const validatedAddress = validateAddress(address);
  if (!validatedAddress) {
    safeErrorLog("Invalid address provided for getting address components");
    return { city: "", state: "", zipCode: "" };
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      safeLog("Google Maps API key is not configured for address components");
      return { city: "", state: "", zipCode: "" };
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      validatedAddress
    )}&components=country:US&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      safeLog("Failed to get address components");
      return { city: "", state: "", zipCode: "" };
    }

    const result = data.results[0];
    let city = "";
    let state = "";
    let zipCode = "";

    // Extract address components
    for (const component of result.address_components) {
      const types = component.types;

      if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.short_name;
      } else if (types.includes("postal_code")) {
        zipCode = component.long_name;
      }
    }

    return { city, state, zipCode };
  } catch (error) {
    safeErrorLog("Error getting address components", error);
    return { city: "", state: "", zipCode: "" };
  }
}
