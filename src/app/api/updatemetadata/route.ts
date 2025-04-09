import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    // Direct database update for California court
    const caCourt = await mongoose.connection.collection("courts").findOne({
      name: "Morley Field Pickleball Courts",
    });

    if (caCourt) {
      await mongoose.connection.collection("courts").updateOne(
        { _id: caCourt._id },
        {
          $set: {
            state: "CA",
            zipCode: "92104",
            indoor: false,
            numberOfCourts: 12,
          },
        }
      );

      console.log("Updated CA court");
    }

    // Direct database update for Tennessee court
    const tnCourt = await mongoose.connection.collection("courts").findOne({
      name: "Nolensville Recreation Center",
    });

    if (tnCourt) {
      await mongoose.connection.collection("courts").updateOne(
        { _id: tnCourt._id },
        {
          $set: {
            state: "TN",
            zipCode: "37135",
            indoor: true,
            numberOfCourts: 4,
          },
        }
      );

      console.log("Updated TN court");
    }

    // Get all courts to verify updates
    const allCourts = await mongoose.connection
      .collection("courts")
      .find({})
      .toArray();

    return NextResponse.json({
      message: "Attempted direct metadata update",
      courts: allCourts,
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
