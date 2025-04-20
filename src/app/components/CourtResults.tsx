"use client";

import React from "react";
import { useCourtSearch } from "../context/CourtSearchContext";
import CourtCard from "./CourtCard";
import Map from "./Map";

const CourtResults: React.FC = () => {
  const { courts, loading, error, mapCenter, mapZoom } = useCourtSearch();

  // Convert courts to markers for the map
  const markers = courts.map((court) => ({
    position: {
      lat: court.location.coordinates[1],
      lng: court.location.coordinates[0],
    },
    title: court.name,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="overflow-y-auto h-[calc(100vh-250px)] p-4 bg-white border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-4 border-black rounded-full animate-spin" />
              <p className="mt-4 text-2xl font-black text-black">
                Searching for courts...
              </p>
            </div>
          </div>
        ) : courts.length > 0 ? (
          <>
            <h3 className="pb-2 mb-4 text-2xl font-black text-black border-black border-b-3">
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
            <div className="p-6 text-center border-3 border-black bg-[var(--accent)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xl font-black text-black">
                Use the search form
                <br />
                to find pickleball courts
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="h-[calc(100vh-250px)] border-3 border-black overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        <Map markers={markers} center={mapCenter || undefined} zoom={mapZoom} />
      </div>
    </div>
  );
};

export default CourtResults;
