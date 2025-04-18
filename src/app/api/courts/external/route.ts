import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoder";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const maxDistance = parseInt(
      searchParams.get("maxDistance") || "50000",
      10
    );

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key is not configured" },
        { status: 500 }
      );
    }

    // Geocode the address
    const location = await geocodeAddress(address);
    if (!location) {
      return NextResponse.json(
        { error: "Could not geocode address" },
        { status: 400 }
      );
    }

    // Search for pickleball courts using Google Places API
    const radius = Math.min(maxDistance, 50000); // Maximum 50km as per Google's limit
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&keyword=pickleball+court&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      console.error(
        "Google Places API returned no results or error:",
        data.status
      );
      return NextResponse.json([]);
    }

    // Transform Google Places results to match our court schema
    const courts = data.results.map((place) => ({
      // Use place_id as the _id to ensure uniqueness
      _id: `gp_${place.place_id}`,
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      // Include placeholder values for required fields
      state: "",
      zipCode: "",
      indoor: false, // Default to outdoor
      numberOfCourts: 1, // Default to 1
      location: {
        type: "Point",
        coordinates: [place.geometry.location.lng, place.geometry.location.lat],
      },
      isVerified: false,
      addedByUser: false,
      source: "google_places",
      lastVerified: new Date(),
    }));

    console.log(`Found ${courts.length} courts from Google Places API`);
    return NextResponse.json(courts);
  } catch (error) {
    console.error("External search error:", error);
    return NextResponse.json(
      { error: "Failed to search external courts" },
      { status: 500 }
    );
  }
}
