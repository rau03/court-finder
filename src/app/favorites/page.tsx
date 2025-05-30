"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Header from "../components/Header";
import CourtCard from "../components/CourtCard";
import Link from "next/link";

export default function Favorites() {
  const router = useRouter();

  // Use Convex query to fetch favorites with court details
  const favorites = useQuery(api.favorites.getUserFavoritesWithDetails, {
    userId: user?.id ?? "",
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        <div className="max-w-4xl p-8 mx-auto text-center">
          <div className="animate-pulse">
            <div className="w-1/3 h-8 mx-auto mb-8 bg-gray-200 rounded"></div>
            <div className="h-32 mb-4 bg-gray-200 rounded"></div>
            <div className="h-32 mb-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />

      <div className="max-w-4xl p-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-blue-900">
          My Favorite Courts
        </h1>

        {favorites === undefined ? (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="animate-pulse">
              <div className="h-32 mb-4 bg-gray-200 rounded"></div>
              <div className="h-32 mb-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <p className="mb-4 text-gray-600">
              You don&apos;t have any favorite courts yet. Find courts and add
              them to your favorites!
            </p>

            <div className="mt-4">
              <Link
                href="/"
                className="inline-block px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Find Courts
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {favorites.map((favorite) => (
              <CourtCard
                key={favorite._id}
                court={favorite.courtId}
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
