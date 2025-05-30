import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { geocodeAddress } from "@/lib/geocoder";
import { OverpassClient } from "@/lib/overpass-client";
import { OverpassCache } from "@/lib/overpass-cache";
import { OverpassMonitoring } from "@/lib/overpass-monitoring";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const overpassClient = new OverpassClient();
const overpassCache = new OverpassCache();
const overpassMonitoring = new OverpassMonitoring();

export async function POST(request: Request) {
  try {
    const params = await request.json();
    console.log("Search params:", params);

    let coordinates = null;
    let overpassCourts = [];

    // Step 1: Geocode the address
    if (params.address) {
      try {
        console.log("Attempting to geocode address:", params.address);
        coordinates = await geocodeAddress(params.address);
        console.log("Geocoded coordinates:", coordinates);

        if (coordinates) {
          // Step 2: Fetch from Overpass API
          const fetchUrl = new URL(
            "/api/courts/fetch",
            process.env.NEXT_PUBLIC_APP_URL
          );
          fetchUrl.searchParams.set("lat", coordinates.lat.toString());
          fetchUrl.searchParams.set("lng", coordinates.lng.toString());
          fetchUrl.searchParams.set("radius", "20");
          console.log("Constructed Overpass API URL:", fetchUrl.toString());

          const response = await fetch(fetchUrl.toString());
          if (!response.ok) {
            console.error("Overpass API error:", response.statusText);
          } else {
            const data = await response.json();
            console.log("Overpass API response:", data);
            overpassCourts = data.courts || [];
          }
        }
      } catch (error) {
        console.error("Error in geocoding or Overpass API:", error);
      }
    }

    // Step 3: Search Convex database
    console.log("Calling Convex query with params:", {
      address: params.address,
      state: params.state,
      zipCode: params.zipCode,
      indoor: params.indoor,
      maxDistance: params.maxDistance,
    });

    const dbCourts = await convex.query(api.courts.searchCourts, {
      address: params.address,
      state: params.state,
      zipCode: params.zipCode,
      indoor: params.indoor,
      maxDistance: params.maxDistance,
    });

    console.log("Convex query response:", JSON.stringify(dbCourts, null, 2));

    // Step 4: Combine and deduplicate results
    const allCourts = [...dbCourts, ...overpassCourts];
    const uniqueCourts = Array.from(
      new Map(allCourts.map((court) => [court.address, court])).values()
    );

    return NextResponse.json({
      courts: uniqueCourts,
      metrics: {
        totalCourts: uniqueCourts.length,
        fromDatabase: dbCourts.length,
        fromOverpass: overpassCourts.length,
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
