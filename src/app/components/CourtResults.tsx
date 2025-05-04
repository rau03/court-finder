"use client";

import React from "react";
import { useCourtSearch } from "../context/CourtSearchContext";
import CourtCard from "./CourtCard";
import MapWrapper from "./MapWrapper";

const CourtResults: React.FC = () => {
  const { courts, loading, error, mapCenter, mapZoom } = useCourtSearch();

  return (
    <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2">
      <div className="overflow-y-auto p-4 bg-[#3bdf72dd] border-3 border-[#222] shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[-0.4deg] relative h-full">
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
            <div className="space-y-6 overflow-y-auto h-[380px]">
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

      <div className="border-3 border-[#222] overflow-hidden shadow-[6px_6px_0px_0px_rgba(30,30,30,0.8)] rotate-[0.4deg] relative bg-[#ffffff33] h-full">
        <MapWrapper
          markers={courts.map((court) => ({
            position: {
              lat: court.location.coordinates[1],
              lng: court.location.coordinates[0],
            },
            title: court.name,
          }))}
          center={mapCenter || { lat: 39.8283, lng: -98.5795 }}
          zoom={mapZoom}
        />
      </div>
    </div>
  );
};

export default CourtResults;
