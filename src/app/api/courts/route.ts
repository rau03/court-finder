import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Court from "@/models/Court";
import { geocodeAddress } from "@/lib/geocoder";

export async function GET(request: Request) {
  try {
    await dbConnect();
    console.log("MongoDB connected successfully");

    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const zipCode = searchParams.get("zipCode");
    const indoor = searchParams.get("indoor");
    const maxDistance = parseInt(
      searchParams.get("maxDistance") || "50000",
      10
    );

    // Build the query based on filters
    const query: any = {};

    if (state) {
      query.state = state.toUpperCase();
      console.log("Filtering by state:", query.state);
    }

    if (zipCode) {
      query.zipCode = zipCode;
      console.log("Filtering by zip code:", query.zipCode);
    }

    if (city) {
      // Case-insensitive search for city
      query.city = new RegExp(city, "i");
      console.log("Filtering by city:", city);
    }

    if (indoor !== null) {
      query.indoor = indoor === "true";
      console.log("Filtering by indoor:", query.indoor);
    }

    // If address is provided, try to perform a geospatial search
    if (address) {
      console.log("Geocoding address for search:", address);
      try {
        const geoData = await geocodeAddress(address);
        if (geoData) {
          console.log("Successfully geocoded to:", geoData);

          // Use a $near geospatial query with the maximum distance provided
          // This will find all courts within the specified radius
          query.location = {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [geoData.lng, geoData.lat],
              },
              $maxDistance: maxDistance,
            },
          };

          // If we have state filtering, make it optional when we have coordinates
          // This helps find more results in case state data is missing or inconsistent
          if (query.state) {
            // Store the state condition
            const stateCondition = query.state;
            // Remove strict state requirement from main query
            delete query.state;

            // Use $or to find courts either with the right state OR nearby without state info
            query.$or = [
              { state: stateCondition },
              { state: { $exists: false } },
              { state: "" },
            ];
          }
        }
      } catch (error) {
        console.error("Failed to geocode for search:", error);
        // Continue with other filters if geocoding fails
      }
    }

    console.log("Executing query with filters:", JSON.stringify(query));
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
  await dbConnect();

  try {
    const body = await request.json();

    // If coordinates aren't provided, try to geocode the address
    if (body.address && (!body.location || !body.location.coordinates)) {
      const geoData = await geocodeAddress(body.address);
      if (geoData) {
        body.location = {
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

    const court = await Court.create(body);
    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create court" },
      { status: 500 }
    );
  }
}
