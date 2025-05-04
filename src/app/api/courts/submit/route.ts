import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import Court from "@/models/Court";
import connectDB from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  const auth = getAuth(request);

  if (!auth.userId) {
    return NextResponse.json(
      { error: "Unauthorized - Must be signed in" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const {
      name,
      location,
      numberOfCourts,
      surface,
      indoor,
      lighting,
      courtType,
      amenities,
    } = data;

    // Validate required fields
    if (!name || !location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const court = new Court({
      name,
      location,
      numberOfCourts,
      surface,
      indoor,
      lighting,
      courtType,
      amenities,
      source: "user-submitted",
      submittedBy: auth.userId,
      submittedAt: new Date(),
    });

    await court.save();

    return NextResponse.json({
      message: "Court submitted successfully",
      court,
    });
  } catch (error) {
    console.error("Error submitting court:", error);
    return NextResponse.json(
      { error: "Failed to submit court" },
      { status: 500 }
    );
  }
}
