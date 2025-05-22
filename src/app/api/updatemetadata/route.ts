import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // Get all courts
    const courts = await convex.query(api.courts.getAllCourts);

    // Find specific courts
    const caCourt = courts.find(
      (court) => court.name === "Morley Field Pickleball Courts"
    );
    const tnCourt = courts.find(
      (court) => court.name === "Nolensville Recreation Center"
    );

    // Update California court
    if (caCourt) {
      await convex.mutation(api.courts.updateCourt, {
        courtId: caCourt._id,
        updates: {
          state: "CA",
          zipCode: "92104",
          indoor: false,
          numberOfCourts: 12,
          updatedAt: Date.now(),
        },
      });
      console.log("Updated CA court");
    }

    // Update Tennessee court
    if (tnCourt) {
      await convex.mutation(api.courts.updateCourt, {
        courtId: tnCourt._id,
        updates: {
          state: "TN",
          zipCode: "37135",
          indoor: true,
          numberOfCourts: 4,
          updatedAt: Date.now(),
        },
      });
      console.log("Updated TN court");
    }

    // Get updated courts
    const updatedCourts = await convex.query(api.courts.getAllCourts);

    return NextResponse.json({
      message: "Metadata update completed",
      courts: updatedCourts,
    });
  } catch (error) {
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      {
        error: "Failed to update metadata",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
