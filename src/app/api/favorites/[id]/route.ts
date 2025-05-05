import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Favorite from "@/models/Favorite";

type RouteContext = {
  params: {
    id: string;
  };
};

// Remove a favorite
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courtId = context.params.id;

    await dbConnect();

    await Favorite.findOneAndDelete({
      userId: user.id,
      courtId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      {
        error: "Failed to remove favorite",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
