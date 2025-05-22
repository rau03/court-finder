import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ExternalCourt {
  id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  numberOfCourts: number;
  surface: string;
  indoor: boolean;
  lighting: boolean;
  courtType: string;
  amenities: string[];
  source: string;
}

interface ExternalApiResponse {
  courts: ExternalCourt[];
}

export async function GET() {
  try {
    // Use Convex query to get external courts
    const courts = await convex.query(api.courts.getExternalCourts);

    return NextResponse.json({ courts });
  } catch (error) {
    console.error("Error fetching external courts:", error);
    return NextResponse.json(
      { error: "Failed to fetch external courts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuth(request);

  if (!auth.userId) {
    return NextResponse.json(
      { error: "Unauthorized - Must be signed in" },
      { status: 401 }
    );
  }

  try {
    const data = (await request.json()) as ExternalApiResponse;

    // Convert external courts to Convex format
    const courts = data.courts.map((court) => ({
      name: court.name,
      location: {
        type: "Point",
        coordinates: court.location.coordinates,
      },
      address: court.address,
      numberOfCourts: court.numberOfCourts,
      surfaceType: court.surface,
      indoor: court.indoor,
      amenities: {
        lightsAvailable: court.lighting,
        // Map other amenities as needed
      },
      source: court.source,
      isVerified: true, // External courts are pre-verified
      addedByUser: false,
      lastVerified: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    // Use Convex mutation to import courts
    await convex.mutation(api.courts.importExternalCourts, { courts });

    return NextResponse.json({ message: "Courts imported successfully" });
  } catch (error) {
    console.error("Error importing external courts:", error);
    return NextResponse.json(
      { error: "Failed to import external courts" },
      { status: 500 }
    );
  }
}
