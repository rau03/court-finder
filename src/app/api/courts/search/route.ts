import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const params = await request.json();
    console.log("Search params received:", params);

    // Validate required parameters
    if (!params.address && !params.state && !params.zipCode) {
      console.log("No search parameters provided");
      return NextResponse.json(
        { error: "At least one search parameter is required" },
        { status: 400 }
      );
    }

    // Ensure indoor is a boolean or undefined
    const indoor =
      params.indoor === true || params.indoor === false
        ? params.indoor
        : undefined;

    // Convert maxDistance to a number if it exists
    const maxDistance = params.maxDistance
      ? Number(params.maxDistance)
      : undefined;

    // Call Convex query
    console.log("Calling Convex query with params:", {
      address: params.address,
      state: params.state,
      zipCode: params.zipCode,
      indoor,
      maxDistance,
    });

    const courts = await convex.query(api.courts.searchCourts, {
      address: params.address,
      state: params.state,
      zipCode: params.zipCode,
      indoor,
      maxDistance,
    });

    console.log("Convex query response:", courts);

    if (!courts) {
      console.log("No courts returned from query");
      return NextResponse.json({ courts: [] });
    }

    return NextResponse.json({ courts });
  } catch (error) {
    console.error("Detailed error in search route:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to search courts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
