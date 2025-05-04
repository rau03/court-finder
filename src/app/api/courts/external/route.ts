import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Court from "@/models/Court";
import connectDB from "@/lib/mongodb";
import type { NextRequest } from "next/server";

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
    await connectDB();

    const courts = await Court.find({
      source: { $ne: "user-submitted" },
    }).lean();

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
    await connectDB();

    const courts = data.courts.map((court) => ({
      name: court.name,
      location: court.location,
      address: court.address,
      numberOfCourts: court.numberOfCourts,
      surface: court.surface,
      indoor: court.indoor,
      lighting: court.lighting,
      courtType: court.courtType,
      amenities: court.amenities,
      source: court.source,
    }));

    await Court.insertMany(courts);

    return NextResponse.json({ message: "Courts imported successfully" });
  } catch (error) {
    console.error("Error importing external courts:", error);
    return NextResponse.json(
      { error: "Failed to import external courts" },
      { status: 500 }
    );
  }
}
