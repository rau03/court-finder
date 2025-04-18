"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface CourtCardProps {
  court: {
    _id: string;
    name: string;
    address: string;
    state: string;
    indoor: boolean;
    numberOfCourts: number;
  };
  isFavorite?: boolean;
}

export default function CourtCard({
  court,
  isFavorite = false,
}: CourtCardProps) {
  const { isSignedIn } = useUser();
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    if (!isSignedIn) {
      // Redirect to sign in if not signed in
      window.location.href = "/sign-in";
      return;
    }

    setLoading(true);
    try {
      if (favorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${court._id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setFavorite(false);
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courtId: court._id }),
        });
        if (response.ok) {
          setFavorite(true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-200 overflow-hidden border-l-4 border-yellow-400">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-xl text-blue-900 mb-2">{court.name}</h3>
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="text-2xl focus:outline-none"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? "❤️" : "🤍"}
          </button>
        </div>
        <p className="text-gray-600 mb-3">{court.address}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-blue-50 rounded-lg p-2">
            <span className="font-semibold text-black">State:</span>{" "}
            <span className="text-black">{court.state}</span>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <span className="font-semibold text-black">Type:</span>{" "}
            <span className="text-black">
              {court.indoor ? "Indoor 🏢" : "Outdoor 🌳"}
            </span>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 col-span-2">
            <span className="font-semibold text-black">Courts:</span>{" "}
            <span className="text-black">{court.numberOfCourts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
