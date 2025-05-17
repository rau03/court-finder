import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import Court from "../src/models/Court";
import Favorite from "../src/models/Favorite";
import dbConnect from "../src/lib/mongodb";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function migrateCourts() {
  try {
    // Connect to MongoDB
    await dbConnect();
    console.log("Connected to MongoDB");

    // Fetch all courts from MongoDB
    const courts = await Court.find({}).lean();
    console.log(`Found ${courts.length} courts in MongoDB`);

    // Migrate each court to Convex
    let successCount = 0;
    let errorCount = 0;

    for (const court of courts) {
      try {
        // Convert MongoDB court to Convex format
        const convexCourt = {
          name: court.name,
          address: court.address,
          city: court.city || "",
          state: court.state,
          zipCode: court.zipCode,
          indoor: court.indoor,
          numberOfCourts: court.numberOfCourts,
          amenities: {
            indoorCourts: court.amenities?.indoorCourts || false,
            outdoorCourts: court.amenities?.outdoorCourts || true,
            lightsAvailable: court.amenities?.lightsAvailable || false,
            restroomsAvailable: court.amenities?.restroomsAvailable || false,
            waterFountain: court.amenities?.waterFountain || false,
          },
          surfaceType: court.surfaceType || "Unknown",
          cost: court.cost || "Unknown",
          hours: court.hours || {
            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: "",
            saturday: "",
            sunday: "",
          },
          contact: court.contact || {
            website: "",
            phone: "",
            email: "",
          },
          location: {
            type: "Point" as const,
            coordinates: court.location.coordinates,
          },
          isVerified: court.isVerified || false,
          addedByUser: court.addedByUser || false,
          lastVerified: court.lastVerified?.getTime() || Date.now(),
          rating: court.rating || 0,
          createdAt: court.createdAt?.getTime() || Date.now(),
          updatedAt: court.updatedAt?.getTime() || Date.now(),
        };

        // Insert into Convex
        await convex.mutation(api.courts.submitCourt, convexCourt);
        successCount++;
        console.log(`Migrated court: ${court.name}`);
      } catch (error) {
        errorCount++;
        console.error(`Failed to migrate court ${court.name}:`, error);
      }
    }

    console.log("\nCourt migration complete!");
    console.log(`Successfully migrated: ${successCount} courts`);
    console.log(`Failed to migrate: ${errorCount} courts`);

    // Migrate favorites
    console.log("\nStarting favorites migration...");
    const favorites = await Favorite.find({}).lean();
    console.log(`Found ${favorites.length} favorites in MongoDB`);

    successCount = 0;
    errorCount = 0;

    for (const favorite of favorites) {
      try {
        // Add favorite to Convex
        await convex.mutation(api.favorites.addFavorite, {
          userId: favorite.userId,
          courtId: favorite.courtId.toString(),
          createdAt: favorite.createdAt?.getTime() || Date.now(),
        });
        successCount++;
        console.log(`Migrated favorite for user: ${favorite.userId}`);
      } catch (error) {
        errorCount++;
        console.error(
          `Failed to migrate favorite for user ${favorite.userId}:`,
          error
        );
      }
    }

    console.log("\nFavorites migration complete!");
    console.log(`Successfully migrated: ${successCount} favorites`);
    console.log(`Failed to migrate: ${errorCount} favorites`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close MongoDB connection
    process.exit(0);
  }
}

// Run the migration
migrateCourts();
