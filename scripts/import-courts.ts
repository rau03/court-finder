import "dotenv/config";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import fs from "fs";
import path from "path";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface CourtData {
  name: string;
  address: string;
  city?: string;
  state: string;
  zipCode: string;
  location: {
    type: string;
    coordinates: number[];
  };
  amenities: {
    indoorCourts?: boolean;
    outdoorCourts?: boolean;
    lightsAvailable?: boolean;
    restroomsAvailable?: boolean;
    waterFountain?: boolean;
  };
  numberOfCourts: number;
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
  isVerified?: boolean;
  addedByUser?: boolean;
  lastVerified?: number;
  rating?: number;
  indoor: boolean;
  contact?: {
    website?: string;
    phone?: string;
    email?: string;
  };
  createdAt?: number;
  updatedAt?: number;
  source?: string;
}

async function importCourts(stateCode: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      "scripts",
      "data",
      `courts-${stateCode.toLowerCase()}.json`
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Ensure all required fields are present
    const courts = data.courts.map((court: CourtData) => ({
      ...court,
      // Ensure location.type is "Point"
      location: {
        type: "Point",
        coordinates: court.location.coordinates,
      },
      // Ensure all required fields are present
      isVerified: court.isVerified ?? true,
      addedByUser: court.addedByUser ?? false,
      lastVerified: court.lastVerified ?? Date.now(),
      createdAt: court.createdAt ?? Date.now(),
      updatedAt: court.updatedAt ?? Date.now(),
      source: court.source ?? "seed-data",
    }));

    const result = await client.mutation(api.courts.importExternalCourts, {
      courts,
    });
    console.log(`Successfully imported ${result.length} ${stateCode} courts`);
  } catch (error) {
    console.error(`Error importing ${stateCode} courts:`, error);
  }
}

// Import courts for a specific state
const stateCode = process.argv[2]?.toUpperCase();
if (!stateCode) {
  console.error("Please provide a state code (e.g., VA, CA, NY)");
  process.exit(1);
}

importCourts(stateCode);
