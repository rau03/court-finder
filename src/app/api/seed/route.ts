import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    console.log("Attempting to connect to MongoDB...");
    await dbConnect();
    console.log("MongoDB connected successfully");

    const { searchParams } = new URL(request.url);
    const resetDB = searchParams.get("reset") === "true";
    console.log("Reset database requested:", resetDB);

    // Reset the database if requested
    if (resetDB) {
      console.log("Clearing existing courts...");
      await mongoose.connection.collection("courts").deleteMany({});
      console.log("Cleared existing courts");
    }

    // Check if we already have courts
    console.log("Checking existing courts...");
    const count = await mongoose.connection
      .collection("courts")
      .countDocuments();
    console.log("Current court count:", count);

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
        },
      ];

      console.log(`Adding ${sampleCourts.length} courts to database...`);

      try {
        // Insert all courts directly using MongoDB driver
        await mongoose.connection.collection("courts").insertMany(sampleCourts);
        console.log("Successfully inserted courts");

        const insertedCount = await mongoose.connection
          .collection("courts")
          .countDocuments();
        console.log("New court count:", insertedCount);

        return NextResponse.json({
          message: `Database seeded with ${insertedCount} sample courts from across the US`,
        });
      } catch (insertError) {
        console.error("Error inserting courts:", insertError);
        throw insertError;
      }
    } else {
      return NextResponse.json({
        message: `Database already has ${count} courts. Use ?reset=true to reseed.`,
      });
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}
