"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface CourtCardProps {
  court: {
    _id: Id<"courts">;
    name: string;
    address: string;
    state: string;
    zipCode: string;
    numberOfCourts: number;
    indoor: boolean;
    location: {
      type: string;
      coordinates: [number, number];
    };
    // Optional properties
    city?: string;
    surfaceType?: string;
    cost?: string;
    amenities?: {
      indoorCourts: boolean;
      outdoorCourts: boolean;
      lightsAvailable: boolean;
      restroomsAvailable: boolean;
      waterFountain: boolean;
    };
    contact?: {
      website: string;
      phone: string;
      email: string;
    };
    hours?: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
  };
  isFavorite?: boolean;
}

export default function CourtCard({
  court,
  isFavorite = false,
}: CourtCardProps) {
  const [loading, setLoading] = useState(false);

  // Use Convex queries and mutations
  const isFavorited = useQuery(api.favorites.isFavorited, {
    userId: "", // No user context
    courtId: court._id,
  });
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);

  // Use isFavorite prop as fallback while query is loading
  const favoriteStatus = isFavorited ?? isFavorite;
  const displayStatus = loading ? favoriteStatus : (isFavorited ?? isFavorite);

  const toggleFavorite = async () => {
    // No auth context, just return
    return;
  };

  return (
    <div
      className={`overflow-hidden bg-white border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,0.8)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] hover:-translate-y-1 transform transition rotate-[${Math.random() < 0.5 ? (Math.random() * 0.5).toFixed(2) : -(Math.random() * 0.5).toFixed(2)}deg] relative`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="mb-2 text-xl font-black text-[#222]">{court.name}</h3>
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`text-2xl transition-transform transform hover:scale-125 focus:outline-none ${loading ? "opacity-50" : ""}`}
            aria-label={
              displayStatus ? "Remove from favorites" : "Add to favorites"
            }
          >
            {displayStatus ? "❤️" : "🤍"}
          </button>
        </div>
        <p className="mb-3 font-bold text-[#222]">
          {court.address}, {court.city}, {court.state} {court.zipCode}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-[var(--accent)] border-2 border-[#222]">
            <span className="font-black text-[#222]">State:</span>{" "}
            <span className="font-bold text-[#222]">{court.state}</span>
          </div>
          <div
            className={`p-2 border-2 border-[#222] ${court.indoor ? "bg-blue-500" : "bg-green-500"}`}
          >
            <span className="font-black text-white">Type:</span>{" "}
            <span className="font-bold text-white">
              {court.indoor ? "Indoor 🏢" : "Outdoor 🌳"}
            </span>
          </div>
          <div className="p-2 col-span-2 bg-[var(--primary)] border-2 border-[#222]">
            <span className="font-black text-white">Courts:</span>{" "}
            <span className="font-bold text-white">{court.numberOfCourts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
