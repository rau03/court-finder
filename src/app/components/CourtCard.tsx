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
    <div className="overflow-hidden bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transform transition">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="mb-2 text-xl font-black text-black">{court.name}</h3>
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="text-2xl transition-transform transform hover:scale-125 focus:outline-none"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? "❤️" : "🤍"}
          </button>
        </div>
        <p className="mb-3 font-bold text-black">{court.address}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-[var(--accent)] border-2 border-black">
            <span className="font-black text-black">State:</span>{" "}
            <span className="font-bold text-black">{court.state}</span>
          </div>
          <div className="p-2 bg-[var(--secondary)] border-2 border-black">
            <span className="font-black text-white">Type:</span>{" "}
            <span className="font-bold text-white">
              {court.indoor ? "Indoor 🏢" : "Outdoor 🌳"}
            </span>
          </div>
          <div className="p-2 col-span-2 bg-[var(--primary)] border-2 border-black">
            <span className="font-black text-white">Courts:</span>{" "}
            <span className="font-bold text-white">{court.numberOfCourts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
