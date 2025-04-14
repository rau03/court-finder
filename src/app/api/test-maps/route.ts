import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key is not configured" },
      { status: 500 }
    );
  }

  try {
    console.log("Testing with API key length:", apiKey.length);

    // Test with a simple geocoding request
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=New%20York&key=${apiKey}`;
    console.log(
      "Testing URL (without key):",
      testUrl.replace(apiKey, "API_KEY")
    );

    const response = await fetch(testUrl);
    const data = await response.json();

    console.log("Google API Response:", data);

    if (data.status === "OK") {
      return NextResponse.json({
        status: "success",
        message: "Google Maps API key is working correctly",
        details: data,
      });
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: `Google Maps API returned status: ${data.status}`,
          error: data.error_message || "Unknown error",
          details: data,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error testing Google Maps API:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to test Google Maps API",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
