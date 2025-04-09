import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Court from "@/models/Court";
import { geocodeAddress } from "@/lib/geocoder";

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const state = searchParams.get("state");
  const indoor = searchParams.get("indoor");
  const maxDistance = parseInt(searchParams.get("maxDistance") || "50000", 10); // Default 50km (~30 miles)

  try {
    // Return all courts if no filters are provided
    if (!address && !state && indoor === null) {
      const allCourts = await Court.find({}).limit(100);
      console.log(`Returning all ${allCourts.length} courts (limited to 100)`);
      return NextResponse.json(allCourts);
    }

    // Build the query based on filters
    const query: any = {};

    // Filter by state if provided
    if (state) {
      query.state = state.toUpperCase();
    }

    // Filter by indoor/outdoor if provided
    if (indoor !== null) {
      query.indoor = indoor === "true";
    }

    // If address is provided, use geocoding and geospatial query
    if (address) {
      const geoData = await geocodeAddress(address);

      if (geoData) {
        console.log(`Geocoded address to: ${geoData.lat}, ${geoData.lng}`);

        // Use MongoDB's geospatial query with the geocoded coordinates
        query.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [geoData.lng, geoData.lat],
            },
            $maxDistance: maxDistance, // in meters
          },
        };

        const courts = await Court.find(query).limit(50);
        console.log(`Found ${courts.length} courts near the provided address`);
        return NextResponse.json(courts);
      } else {
        // If geocoding fails, fall back to text search
        console.log("Geocoding failed, falling back to text search");
        const searchRegex = new RegExp(address.split(" ").join(".*"), "i");
        query.address = { $regex: searchRegex };
      }
    }

    // Execute query with any filters that were added
    const courts = await Court.find(query).limit(50);
    console.log(`Found ${courts.length} courts matching filters`);
    return NextResponse.json(courts);
  } catch (error) {
    console.error("Error searching courts:", error);
    return NextResponse.json(
      { error: "Failed to search courts" },
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
