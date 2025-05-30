import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug: Print environment variables
console.log("Environment variables loaded:");
console.log("NEXT_PUBLIC_CONVEX_URL:", process.env.NEXT_PUBLIC_CONVEX_URL);

// Initialize Convex client
const convex = new ConvexHttpClient("https://quaint-wren-249.convex.cloud");

// Function to load court data from JSON files
function loadCourtData(): any[] {
  const dataDir = path.join(__dirname, "data");
  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.startsWith("courts-"));

  let allCourts: any[] = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const courts = JSON.parse(fileContent);

    // Add required fields to each court
    const enrichedCourts = courts.map((court: any) => ({
      ...court,
      addedByUser: false,
      isVerified: true,
      lastVerified: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rating: 0,
      source: "seed-data",
    }));

    allCourts = allCourts.concat(enrichedCourts);
  }

  return allCourts;
}

// Function to seed courts in batches
async function seedCourtsInBatches(courts: any[], batchSize: number = 100) {
  console.log(
    `Starting to seed ${courts.length} courts in batches of ${batchSize}...`
  );

  for (let i = 0; i < courts.length; i += batchSize) {
    const batch = courts.slice(i, i + batchSize);
    console.log(
      `Seeding batch ${Math.floor(i / batchSize) + 1} (${batch.length} courts)...`
    );

    try {
      await convex.mutation(api.courts.importExternalCourts, { courts: batch });
      console.log(`Successfully seeded batch ${Math.floor(i / batchSize) + 1}`);
    } catch (error) {
      console.error(
        `Error seeding batch ${Math.floor(i / batchSize) + 1}:`,
        error
      );
    }
  }
}

// Main function
async function main() {
  try {
    const courts = loadCourtData();
    console.log(`Loaded ${courts.length} courts from data files`);

    await seedCourtsInBatches(courts);
    console.log("Finished seeding all courts");
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

// Run the script
main();
