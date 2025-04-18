import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Court from "@/models/Court";
import { geocodeAddress } from "@/lib/geocoder";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: "Name and address are required" },
        { status: 400 }
      );
    }

    // Check for duplicate courts
    const existing = await Court.findOne({
      name: body.name,
      address: body.address,
    });

    if (existing) {
      return NextResponse.json(
        { error: "This court already exists in our database" },
        { status: 409 }
      );
    }

    // Geocode the address
    const geoData = await geocodeAddress(body.address);
    if (!geoData) {
      return NextResponse.json(
        { error: "Could not geocode address" },
        { status: 400 }
      );
    }

    // Extract city and state from address if not provided
    if (!body.city || !body.state) {
      try {
        const addressComponents = await getAddressComponents(body.address);
        if (!body.city) body.city = addressComponents.city;
        if (!body.state) body.state = addressComponents.state;
        if (!body.zipCode) body.zipCode = addressComponents.zipCode;
      } catch (error) {
        console.error("Error extracting address components:", error);
      }
    }

    // Create court with geocoded location
    const court = await Court.create({
      ...body,
      location: {
        type: "Point",
        coordinates: [geoData.lng, geoData.lat],
      },
      isVerified: false,
      addedByUser: true,
      lastVerified: new Date(),
    });

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    console.error("Error submitting court:", error);
    return NextResponse.json(
      { error: "Failed to submit court" },
      { status: 500 }
    );
  }
}

// Helper function to extract address components
async function getAddressComponents(address: string) {
  // You can implement this using Google's Geocoding API or similar service
  // For now, returning empty values
  return { city: "", state: "", zipCode: "" };
}
