import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Add this line to mark the route as dynamic
export const dynamic = "force-dynamic";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    console.log("Starting database seed process...");

    const { searchParams } = new URL(request.url);
    const resetDB = searchParams.get("reset") === "true";
    console.log("Reset database requested:", resetDB);

    // Reset the database if requested
    if (resetDB) {
      console.log("Attempting to clear existing courts...");
      try {
        await convex.mutation(api.courts.clearAllCourts);
        console.log("Successfully cleared existing courts");
      } catch (clearError) {
        console.error("Failed to clear courts:", clearError);
        throw new Error(
          `Failed to clear courts: ${clearError instanceof Error ? clearError.message : "Unknown error"}`
        );
      }
    }

    // Check if we already have courts
    console.log("Checking existing courts...");
    let count;
    try {
      const courts = await convex.query(api.courts.getAllCourts);
      count = courts.length;
      console.log("Current court count:", count);
    } catch (countError) {
      console.error("Failed to count courts:", countError);
      throw new Error(
        `Failed to count courts: ${countError instanceof Error ? countError.message : "Unknown error"}`
      );
    }

    if (count === 0 || resetDB) {
      // Sample courts from across the United States with all metadata
      const sampleCourts = [
        // Tennessee
        {
          name: "Nolensville Recreation Center",
          address: "7318 Nolensville Rd, Nolensville, TN 37135",
          location: {
            type: "Point",
            coordinates: [-86.6694, 35.9523],
          },
          state: "TN",
          zipCode: "37135",
          indoor: true,
          numberOfCourts: 4,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          name: "Edmondson Park",
          address: "5900 Edmondson Pike, Nashville, TN 37211",
          location: {
            type: "Point",
            coordinates: [-86.7222, 36.0334],
          },
          state: "TN",
          zipCode: "37211",
          indoor: false,
          numberOfCourts: 2,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          name: "Brentwood Community Center",
          address: "5211 Maryland Way, Brentwood, TN 37027",
          location: {
            type: "Point",
            coordinates: [-86.7828, 36.0326],
          },
          state: "TN",
          zipCode: "37027",
          indoor: true,
          numberOfCourts: 6,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        // California
        {
          name: "Morley Field Pickleball Courts",
          address: "2221 Morley Field Dr, San Diego, CA 92104",
          location: {
            type: "Point",
            coordinates: [-117.1454, 32.7395],
          },
          state: "CA",
          zipCode: "92104",
          indoor: false,
          numberOfCourts: 12,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          name: "Bobby Riggs Racket & Paddle",
          address: "875 Santa Fe Dr, Encinitas, CA 92024",
          location: {
            type: "Point",
            coordinates: [-117.2644, 33.0405],
          },
          state: "CA",
          zipCode: "92024",
          indoor: true,
          numberOfCourts: 8,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        // New York
        {
          name: "Central Park Courts",
          address: "W 96th St, New York, NY 10025",
          location: {
            type: "Point",
            coordinates: [-73.9654, 40.7913],
          },
          state: "NY",
          zipCode: "10025",
          indoor: false,
          numberOfCourts: 4,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        // Florida
        {
          name: "East Naples Community Park",
          address: "3500 Thomasson Dr, Naples, FL 34112",
          location: {
            type: "Point",
            coordinates: [-81.7673, 26.1224],
          },
          state: "FL",
          zipCode: "34112",
          indoor: false,
          numberOfCourts: 64,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        // Texas
        {
          name: "Chicken N Pickle Austin",
          address: "5001 183 Toll Road, Austin, TX 78717",
          location: {
            type: "Point",
            coordinates: [-97.7695, 30.4887],
          },
          state: "TX",
          zipCode: "78717",
          indoor: true,
          numberOfCourts: 10,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        // Washington
        {
          name: "Pickleball Station",
          address: "1920 124th Ave NE, Bellevue, WA 98005",
          location: {
            type: "Point",
            coordinates: [-122.1774, 47.6293],
          },
          state: "WA",
          zipCode: "98005",
          indoor: true,
          numberOfCourts: 14,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        // Arizona
        {
          name: "Palm Creek Pickleball Complex",
          address: "1110 N Henness Rd, Casa Grande, AZ 85122",
          location: {
            type: "Point",
            coordinates: [-111.7468, 32.8964],
          },
          state: "AZ",
          zipCode: "85122",
          indoor: false,
          numberOfCourts: 24,
          isVerified: true,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      console.log(`Attempting to insert ${sampleCourts.length} courts...`);

      try {
        // Insert all courts using Convex mutation
        await convex.mutation(api.courts.seedCourts, { courts: sampleCourts });
        console.log("Successfully inserted sample courts");

        const courts = await convex.query(api.courts.getAllCourts);
        console.log("New court count:", courts.length);

        return NextResponse.json({
          success: true,
          message: "Database seeded successfully",
          count: courts.length,
        });
      } catch (insertError) {
        console.error("Failed to insert courts:", insertError);
        throw new Error(
          `Failed to insert courts: ${insertError instanceof Error ? insertError.message : "Unknown error"}`
        );
      }
    } else {
      return NextResponse.json({
        success: true,
        message: "Database already seeded",
        count,
      });
    }
  } catch (error) {
    console.error("Seed process failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
