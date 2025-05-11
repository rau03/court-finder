import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Court from "@/models/Court";
import { geocodeAddress } from "@/lib/geocoder";

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
    console.log("Attempting to connect to MongoDB...");
    await dbConnect();
    console.log("MongoDB connected successfully");

    const { searchParams } = new URL(request.url);
    const params = validateParams(searchParams);
    console.log("Search parameters:", params);

    // Build the query based on filters
    const query: Record<string, unknown> = {};

    if (params.state) {
      query.state = params.state;
      console.log("Filtering by state:", params.state);
    }

    if (params.zipCode) {
      query.zipCode = params.zipCode;
      console.log("Filtering by zip code:", params.zipCode);
    }

    if (params.city) {
      query.city = new RegExp(params.city, "i");
      console.log("Filtering by city:", params.city);
    }

    if (params.indoor !== null) {
      query.indoor = params.indoor;
      console.log("Filtering by indoor status:", params.indoor);
    }

    // If address is provided, try to perform a geospatial search
    if (params.address) {
      console.log("Geocoding address for search:", params.address);
      try {
        const geoData = await geocodeAddress(params.address);
        if (geoData) {
          console.log("Successfully geocoded location:", geoData);

          query.location = {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [geoData.lng, geoData.lat],
              },
              $maxDistance: params.maxDistance,
            },
          };

          if (query.state) {
            const stateCondition = query.state;
            delete query.state;
            query.$or = [
              { state: stateCondition },
              { state: { $exists: false } },
              { state: "" },
            ];
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    }

    console.log("Executing query:", JSON.stringify(query));
    const courts = await Court.find(query).limit(100);
    console.log(`Found ${courts.length} courts matching filters`);

    return NextResponse.json({
      courts,
      count: courts.length,
    });
  } catch (error) {
    console.error("Database error:", error);
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
    await dbConnect();

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

    // Sanitize inputs to prevent injection
    const sanitizedBody = {
      ...body,
      name: body.name.trim().replace(/[<>]/g, ""),
      address: body.address.trim().replace(/[<>]/g, ""),
      state: body.state.trim().toUpperCase(),
      zipCode: body.zipCode ? body.zipCode.trim().replace(/[<>]/g, "") : "",
    };

    // If coordinates aren't provided, try to geocode the address
    if (
      sanitizedBody.address &&
      (!sanitizedBody.location || !sanitizedBody.location.coordinates)
    ) {
      safeLog("Geocoding address for new court");
      const geoData = await geocodeAddress(sanitizedBody.address);
      if (geoData) {
        sanitizedBody.location = {
          type: "Point",
          coordinates: [geoData.lng, geoData.lat],
        };
      } else {
        return NextResponse.json(
          { error: "Could not geocode the provided address" },
          { status: 400 }
        );
      }
    }

    const court = await Court.create(sanitizedBody);
    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    safeErrorLog("Failed to create court:", error);
    return NextResponse.json(
      {
        error: "Failed to create court",
        details: isProduction
          ? "Server error"
          : error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
