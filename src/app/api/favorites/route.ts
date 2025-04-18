import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import Court from "@/models/Court";

// Get user's favorites
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const favorites = await Favorite.find({ userId: user.id })
      .populate("courtId")
      .lean();

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Failed to get favorites:", error);
    return NextResponse.json(
      {
        error: "Failed to get favorites",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Add a favorite
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courtId } = await request.json();

    if (!courtId) {
      return NextResponse.json(
        { error: "Court ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify court exists
    const court = await Court.findById(courtId);
    if (!court) {
      return NextResponse.json({ error: "Court not found" }, { status: 404 });
    }

    // Create favorite
    const favorite = await Favorite.create({
      userId: user.id,
      courtId,
    });

    return NextResponse.json({ success: true, favorite });
  } catch (error) {
    console.error("Error adding favorite:", error);

    // Handle duplicate error
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json(
        { error: "Court already in favorites" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}
