import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { geocodeAddress } from "@/lib/geocoder";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Environment detection
const isProduction = process.env.NODE_ENV === "production";

/**
 * Safely log information based on environment
 */
function safeLog(message: string, data?: unknown) {
  if (isProduction) {
    console.log(message);
  } else {
    console.log(message, data || "");
  }
}

interface SearchParams {
  address?: string;
  state?: string;
  zipCode?: string;
  indoor?: boolean;
  maxDistance?: number;
}

/**
 * Validate and sanitize search parameters
 */
function validateSearchParams(params: SearchParams) {
  // Sanitize and validate address
  const address = params.address?.trim().replace(/[<>]/g, "") || undefined;

  // Validate state (must be 2 letters for US states)
  const state = params.state?.trim().toUpperCase().replace(/[<>]/g, "");
  const validState = state && /^[A-Z]{2}$/.test(state) ? state : undefined;

  // Validate zip code format
  const zipCode = params.zipCode?.trim().replace(/[<>]/g, "");
  const validZipCode =
    zipCode && /^\d{5}(-\d{4})?$/.test(zipCode) ? zipCode : undefined;

  // Validate indoor parameter
  const indoor = typeof params.indoor === "boolean" ? params.indoor : undefined;

  // Validate maxDistance (ensure it's a reasonable number)
  let maxDistance = 50000; // Default 50km
  if (params.maxDistance) {
    const parsedDistance = Number(params.maxDistance);
    if (
      !isNaN(parsedDistance) &&
      parsedDistance > 0 &&
      parsedDistance <= 100000
    ) {
      maxDistance = parsedDistance;
    }
  }

  return {
    address,
    state: validState,
    zipCode: validZipCode,
    indoor,
    maxDistance,
  };
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

    const params = await request.json();
    safeLog("Search params:", params);

    // Validate and sanitize parameters
    const validatedParams = validateSearchParams(params);

    // Step 1: Geocode the address if provided
    let coordinates = null;
    if (validatedParams.address) {
      try {
        safeLog("Attempting to geocode address:", validatedParams.address);
        coordinates = await geocodeAddress(validatedParams.address);
        safeLog("Geocoded coordinates:", coordinates);
      } catch (error) {
        console.error("Error in geocoding:", error);
      }
    }

    // Step 2: Search Convex database
    safeLog("Calling Convex query with params:", validatedParams);

    const courts = await convex.query(api.courts.searchCourts, {
      ...validatedParams,
      coordinates: coordinates ? [coordinates.lng, coordinates.lat] : undefined,
    });

    safeLog("Convex query response:", JSON.stringify(courts, null, 2));

    return NextResponse.json({
      courts,
      metrics: {
        totalCourts: courts.length,
      },
    });
  } catch (error) {
    console.error("Error in search route:", error);
    return NextResponse.json(
      { error: "Failed to search courts" },
      { status: 500 }
    );
  }
}
