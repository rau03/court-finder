import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { geocodeAddress } from "@/lib/geocoder";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Environment detection
const isProduction = process.env.NODE_ENV === "production";

/**
 * Safely log information based on environment
 * @param message The message to log
 * @param data Optional data to log in development only
 */
function safeLog(message: string, data?: unknown) {
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
function safeErrorLog(message: string, error?: unknown) {
  if (isProduction) {
    // In production, don't log potentially sensitive error details
    console.error(message);
  } else {
    // In development, we can log full error details
    console.error(message, error || "");
  }
}

/**
 * Validate and sanitize input parameters
 * @param params The parameters to validate
 * @returns Sanitized parameters or null values if invalid
 */
function validateParams(params: URLSearchParams) {
  // Get and sanitize parameters
  const address = params.get("address")?.trim().replace(/[<>]/g, "") || null;
  const city = params.get("city")?.trim().replace(/[<>]/g, "") || null;
  const state =
    params.get("state")?.trim().toUpperCase().replace(/[<>]/g, "") || null;
  const zipCode = params.get("zipCode")?.trim().replace(/[<>]/g, "") || null;
  const indoor = params.get("indoor");

  // Validate maxDistance (ensure it's a reasonable number)
  let maxDistance = 50000; // Default 50km
  const maxDistanceParam = params.get("maxDistance");
  if (maxDistanceParam) {
    const parsedDistance = parseInt(maxDistanceParam, 10);
    if (
      !isNaN(parsedDistance) &&
      parsedDistance > 0 &&
      parsedDistance <= 100000
    ) {
      maxDistance = parsedDistance;
    }
  }

  // Validate state (must be 2 letters for US states)
  const validState = state && /^[A-Z]{2}$/.test(state) ? state : null;

  // Validate zip code format
  const validZipCode =
    zipCode && /^\d{5}(-\d{4})?$/.test(zipCode) ? zipCode : null;

  // Convert indoor to boolean
  const indoorBool =
    indoor === "true" ? true : indoor === "false" ? false : null;

  return {
    address,
    city,
    state: validState,
    zipCode: validZipCode,
    indoor: indoorBool,
    maxDistance,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = validateParams(searchParams);
    safeLog("Search parameters:", params);

    // Use Convex searchCourts query
    const courts = await convex.query(api.courts.searchCourts, {
      address: params.address || undefined,
      state: params.state || undefined,
      zipCode: params.zipCode || undefined,
      indoor: params.indoor || undefined,
      maxDistance: params.maxDistance,
    });

    safeLog(`Found ${courts.length} courts matching filters`);

    return NextResponse.json({
      courts,
      count: courts.length,
    });
  } catch (error) {
    safeErrorLog("Error searching courts:", error);
    return NextResponse.json(
      {
        error: "Failed to search courts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Validate content type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (!body.name || !body.address || !body.state) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, address, and state are required",
        },
        { status: 400 }
      );
    }

    // Geocode the address if not provided
    if (!body.location) {
      try {
        const geoData = await geocodeAddress(body.address);
        if (geoData) {
          body.location = {
            type: "Point",
            coordinates: [geoData.lng, geoData.lat],
          };
        }
      } catch (error) {
        safeErrorLog("Geocoding error:", error);
        return NextResponse.json(
          { error: "Failed to geocode address" },
          { status: 400 }
        );
      }
    }

    // Submit court using Convex mutation
    const courtId = await convex.mutation(api.courts.submitCourt, {
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      indoor: body.indoor || false,
      numberOfCourts: body.numberOfCourts || 1,
      amenities: {
        indoorCourts: body.amenities?.indoorCourts,
        outdoorCourts: body.amenities?.outdoorCourts,
        lightsAvailable: body.amenities?.lightsAvailable,
        restroomsAvailable: body.amenities?.restroomsAvailable,
        waterFountain: body.amenities?.waterFountain,
      },
      surfaceType: body.surfaceType,
      cost: body.cost,
      hours: body.hours,
      contact: body.contact,
      location: body.location,
    });

    return NextResponse.json({
      success: true,
      courtId,
      message: "Court submitted successfully and pending approval",
    });
  } catch (error) {
    safeErrorLog("Error submitting court:", error);
    return NextResponse.json(
      {
        error: "Failed to submit court",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
