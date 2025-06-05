"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import CourtCard from "../components/CourtCard";
import { Loader2 } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

interface Favorite {
  _id: string;
  courtId: Doc<"courts">;
  createdAt: number;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const favorites = useQuery(api.favorites.getUserFavoritesWithDetails, {
    userId: userId ?? "",
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [router, isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!favorites) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">My Favorite Courts</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-500">
          You haven&apos;t added any courts to your favorites yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite: Favorite) => (
            <CourtCard key={favorite._id} court={favorite.courtId} />
          ))}
        </div>
      )}
    </div>
  );
}
