"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import CourtCard from "../components/CourtCard";
import Link from "next/link";

interface Court {
  _id: string;
  name: string;
  address: string;
  state: string;
  indoor: boolean;
  numberOfCourts: number;
  location: {
    type: string;
    coordinates: number[];
  };
}

interface Favorite {
  _id: string;
  userId: string;
  courtId: Court;
}

export default function Favorites() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, isLoaded, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchFavorites();
    }
  }, [isSignedIn]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/favorites");

      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }

      const data = await response.json();
      setFavorites(data.favorites);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Failed to load your favorite courts");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
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

        {error && (
          <div className="p-4 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
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
