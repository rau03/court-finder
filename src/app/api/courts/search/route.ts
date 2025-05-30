import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { geocodeAddress } from "@/lib/geocoder";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const params = await request.json();
    console.log("Search params:", params);

    // Step 1: Geocode the address if provided
    let coordinates = null;
    if (params.address) {
      try {
        console.log("Attempting to geocode address:", params.address);
        coordinates = await geocodeAddress(params.address);
        console.log("Geocoded coordinates:", coordinates);
      } catch (error) {
        console.error("Error in geocoding:", error);
      }
    }

    // Step 2: Search Convex database
    console.log("Calling Convex query with params:", {
      address: params.address,
      state: params.state,
      zipCode: params.zipCode,
      indoor: params.indoor,
      maxDistance: params.maxDistance,
    });

    const courts = await convex.query(api.courts.searchCourts, {
      address: params.address,
      state: params.state,
      zipCode: params.zipCode,
      indoor: params.indoor,
      maxDistance: params.maxDistance,
    });

    console.log("Convex query response:", JSON.stringify(courts, null, 2));

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
