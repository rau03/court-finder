"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useCourtSearch } from "../context/CourtSearchContext";
import CourtCard from "./CourtCard";
import PickleballMap from "./Map";
import MapWrapper from "./MapWrapper";

const CourtResults: React.FC = () => {
  const { courts, loading, error, mapCenter, mapZoom } = useCourtSearch();
  const [mapsAvailable, setMapsAvailable] = useState(true);

  // Memoize markers to prevent unnecessary re-renders
  const markers = useMemo(
    () =>
      courts.map((court) => ({
        position: {
          lat: court.location.coordinates[1],
          lng: court.location.coordinates[0],
        },
        title: court.name,
      })),
    [courts]
  );

  // Check if Google Maps is available
  useEffect(() => {
    const checkMapsAvailability = () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        setMapsAvailable(false);
        return;
      }

      // Check if Google Maps script loaded
      if (typeof window !== "undefined" && !window.google) {
        // Give it a moment to load
        setTimeout(() => {
          if (!window.google) {
            console.warn("Google Maps not available, using fallback");
            setMapsAvailable(false);
          }
        }, 3000);
      }
    };

    checkMapsAvailability();
  }, []);

  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
      {/* Court List */}
      <div className="p-4 bg-[#3bdf72dd] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.4deg] relative h-[600px] overflow-y-auto">
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border-3 border-[#222] shadow-[3px_3px_0px_0px_rgba(30,30,30,0.8)] rotate-[0.4deg]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-4 border-[#222] rounded-full animate-spin" />
              <p className="mt-4 text-2xl font-black text-[#222]">
                Searching for courts...
              </p>
            </div>
          </div>
        ) : courts.length > 0 ? (
          <>
            <h3 className="pb-2 mb-4 text-2xl font-black text-[#222] border-[#222] border-b-3 inline-block rotate-[0.2deg]">
              {courts.length} Courts Found
            </h3>
            <div className="space-y-6">
              {courts.map((court) => (
                <CourtCard key={court._id} court={court} />
              ))}
            </div>
          </>
        ) : !loading && !error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="p-6 text-center border-3 border-[#222] bg-[var(--accent)] shadow-[4px_4px_0px_0px_rgba(30,30,30,0.8)] rotate-[0.6deg]">
              <p className="text-xl font-black text-[#222]">
                Use the search form
                <br />
                to find pickleball courts
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Map */}
      <div className="border-3 border-[#222] overflow-hidden shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[0.4deg] relative bg-[#ffffff33] h-[600px]">
        {mapsAvailable ? (
          <PickleballMap
            markers={markers}
            center={mapCenter || { lat: 39.8283, lng: -98.5795 }}
            zoom={mapZoom}
          />
        ) : (
          <MapWrapper
            markers={markers}
            center={mapCenter || { lat: 39.8283, lng: -98.5795 }}
            zoom={mapZoom}
          />
        )}
      </div>
    </div>
  );
};

export default CourtResults;
