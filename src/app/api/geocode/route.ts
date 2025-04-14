import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoder";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  try {
    const location = await geocodeAddress(address);

    if (!location) {
      return NextResponse.json(
        { error: "Could not geocode the provided address" },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
