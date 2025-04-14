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
    const state = searchParams.get("state");
    const zipCode = searchParams.get("zipCode");
    const indoor = searchParams.get("indoor");
    const maxDistance = parseInt(
      searchParams.get("maxDistance") || "50000",
      10
    );

    // Return all courts if no filters are provided
    if (!address && !state && !zipCode && indoor === null) {
      const allCourts = await Court.find({}).limit(100);
      console.log(`Returning all ${allCourts.length} courts (limited to 100)`);

      if (!allCourts || allCourts.length === 0) {
        console.log("No courts found in database");
        return NextResponse.json([]);
      }

      return NextResponse.json(allCourts);
    }

    // Build the query based on filters
    const query: any = {};

    if (state) {
      query.state = state.toUpperCase();
    }

    if (zipCode) {
      query.zipCode = zipCode;
    }

    if (indoor !== null) {
      query.indoor = indoor === "true";
    }

    console.log("Executing query with filters:", query);
    const courts = await Court.find(query).limit(50);
    console.log(`Found ${courts.length} courts matching filters`);

    return NextResponse.json(courts);
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
