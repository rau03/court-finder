import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" }); // Load .env.local first
dotenv.config(); // Then load .env if it exists

// Define the court data structure
interface CourtData {
  name: string;
  address: string;
  city?: string;
  state: string;
  zipCode: string;
  indoor: boolean;
  numberOfCourts: number;
  amenities: {
    indoorCourts?: boolean;
    outdoorCourts?: boolean;
    lightsAvailable?: boolean;
    restroomsAvailable?: boolean;
    waterFountain?: boolean;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  surfaceType?: string;
  cost?: string;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  contact?: {
    website?: string;
    phone?: string;
    email?: string;
  };
  source?: string;
}

// Function to get Convex URL with validation
function getConvexUrl(): string {
  const deployment = process.env.CONVEX_DEPLOYMENT;
  if (!deployment) {
    throw new Error("CONVEX_DEPLOYMENT environment variable is not set");
  }

  // Extract the deployment name from the format "local:deployment-name" or "team:deployment-name"
  const deploymentName = deployment.split(":")[1];
  if (!deploymentName) {
    throw new Error(
      'Invalid CONVEX_DEPLOYMENT format. Expected format: "local:deployment-name" or "team:deployment-name"'
    );
  }

  // For local development, use the local Convex URL
  if (deployment.startsWith("local:")) {
    return "http://127.0.0.1:3210"; // Default local Convex URL
  }

  // For production deployments
  return `https://${deploymentName}.convex.cloud`;
}

// Function to verify Convex connection
async function verifyConvexConnection(convex: ConvexClient): Promise<boolean> {
  try {
    // Try to query the courts table to verify connection
    await convex.query(api.courts.getVerifiedCourts, {});
    console.log("✅ Successfully connected to Convex");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to Convex:", error);
    return false;
  }
}

// Function to validate court data
function validateCourtData(court: CourtData): string[] {
  const errors: string[] = [];

  // Required fields
  if (!court.name) errors.push("Court name is required");
  if (!court.address) errors.push("Address is required");
  if (!court.state) errors.push("State is required");
  if (!court.zipCode) errors.push("Zip code is required");
  if (typeof court.indoor !== "boolean")
    errors.push("Indoor status is required");
  if (typeof court.numberOfCourts !== "number")
    errors.push("Number of courts is required");

  // Location validation
  if (!court.location?.coordinates || court.location.coordinates.length !== 2) {
    errors.push("Valid location coordinates are required");
  }

  // State format validation
  if (court.state && !/^[A-Z]{2}$/.test(court.state)) {
    errors.push('State must be a 2-letter code (e.g., "NY", "CA")');
  }

  // Zip code format validation
  if (court.zipCode && !/^\d{5}(-\d{4})?$/.test(court.zipCode)) {
    errors.push("Zip code must be in format 12345 or 12345-6789");
  }

  return errors;
}

// Function to format court data for Convex
function formatCourtForConvex(court: CourtData) {
  const now = Date.now();
  return {
    ...court,
    isVerified: true,
    addedByUser: false,
    lastVerified: now,
    createdAt: now,
    updatedAt: now,
    source: court.source || "seed-data",
  };
}

// Function to load court data from JSON files
async function loadCourtDataFromFiles(): Promise<CourtData[]> {
  const dataDir = path.join(__dirname, "data");

  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory not found: ${dataDir}`);
  }

  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"));

  if (files.length === 0) {
    throw new Error(`No JSON files found in ${dataDir}`);
  }

  let allCourts: CourtData[] = [];
  let validationErrors: { file: string; errors: string[] }[] = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const courts = JSON.parse(fileContent) as CourtData[];

      // Validate each court
      courts.forEach((court, index) => {
        const errors = validateCourtData(court);
        if (errors.length > 0) {
          validationErrors.push({
            file,
            errors: errors.map((err) => `Court ${index + 1}: ${err}`),
          });
        }
      });

      allCourts = allCourts.concat(courts);
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
      throw error;
    }
  }

  if (validationErrors.length > 0) {
    console.error("Validation errors found:");
    validationErrors.forEach(({ file, errors }) => {
      console.error(`\nIn ${file}:`);
      errors.forEach((err) => console.error(`  - ${err}`));
    });
    throw new Error("Court data validation failed");
  }

  return allCourts;
}

// Function to seed courts into Convex
async function seedCourts(courts: CourtData[], dryRun: boolean = false) {
  const convexUrl = getConvexUrl();
  console.log(`Using Convex URL: ${convexUrl}`);

  const convex = new ConvexClient(convexUrl);

  // Verify connection
  const isConnected = await verifyConvexConnection(convex);
  if (!isConnected) {
    throw new Error(
      "Failed to connect to Convex. Please check your connection and try again."
    );
  }

  try {
    const formattedCourts = courts.map(formatCourtForConvex);

    if (dryRun) {
      console.log("\n=== DRY RUN MODE ===");
      console.log(`Would seed ${formattedCourts.length} courts:`);
      formattedCourts.forEach((court, index) => {
        console.log(`\n${index + 1}. ${court.name}`);
        console.log(
          `   Address: ${court.address}, ${court.city}, ${court.state} ${court.zipCode}`
        );
        console.log(
          `   Courts: ${court.numberOfCourts} (${court.indoor ? "Indoor" : "Outdoor"})`
        );
      });
      return [];
    }

    const result = await convex.mutation(api.courts.importExternalCourts, {
      courts: formattedCourts,
    });
    console.log(`Successfully seeded ${result.length} courts`);
    return result;
  } catch (error) {
    console.error("Error seeding courts:", error);
    throw error;
  }
}

// Main function to run the seeding process
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");

    console.log("Loading court data from files...");
    const courts = await loadCourtDataFromFiles();
    console.log(`Loaded ${courts.length} courts from files`);

    console.log("Seeding courts to Convex...");
    await seedCourts(courts, dryRun);

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { seedCourts, type CourtData };
