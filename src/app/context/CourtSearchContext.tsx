"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { SearchParams } from "../components/SearchForm";
import { Id } from "../../../convex/_generated/dataModel";

interface Court {
  _id: Id<"courts">;
  name: string;
  address: string;
  state: string;
  zipCode: string;
  indoor: boolean;
  numberOfCourts: number;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface CourtSearchContextType {
  courts: Court[];
  loading: boolean;
  error: string | null;
  mapCenter: { lat: number; lng: number } | null;
  mapZoom: number;
  searchCourts: (searchParams: SearchParams) => Promise<void>;
  resetSearch: () => void;
}

const CourtSearchContext = createContext<CourtSearchContextType | undefined>(
  undefined
);

export const useCourtSearch = () => {
  const context = useContext(CourtSearchContext);
  if (context === undefined) {
    throw new Error("useCourtSearch must be used within a CourtSearchProvider");
  }
  return context;
};

interface CourtSearchProviderProps {
  children: ReactNode;
}

export const CourtSearchProvider: React.FC<CourtSearchProviderProps> = ({
  children,
}) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState(4);

  const searchCourts = async (searchParams: SearchParams) => {
    setLoading(true);
    setError(null);
    setCourts([]);

    try {
      const { address, state, zipCode, indoor, maxDistance } = searchParams;

      // Validate that at least one search parameter is provided
      if (!address.trim() && !state && !zipCode.trim()) {
        setError(
          "Please provide at least a location, state, or zip code to search"
        );
        setLoading(false);
        return;
      }

      // Add state and USA to make the search more specific
      let searchAddress = address.trim();
      if (state && !searchAddress.includes(state)) {
        searchAddress = `${searchAddress}, ${state}`;
      }

      // Add "USA" to prioritize US locations
      if (
        !searchAddress.toLowerCase().includes("usa") &&
        !searchAddress.toLowerCase().includes("united states")
      ) {
        searchAddress = `${searchAddress}, USA`;
      }

      console.log("Searching for courts with address:", searchAddress);

      // Build the query parameters
      const params = {
        address: searchAddress || undefined,
        state: state || undefined,
        zipCode: zipCode.trim() || undefined,
        indoor: typeof indoor === "boolean" ? indoor : undefined,
        maxDistance: maxDistance ? Number(maxDistance) : undefined,
      };

      // Use Convex query to search courts
      const searchResults = await fetch("/api/courts/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!searchResults.ok) {
        const errorData = await searchResults.json();
        console.error("Search API error response:", errorData);
        throw new Error(
          errorData.details || errorData.error || "Failed to search courts"
        );
      }

      const data = await searchResults.json();
      console.log("Search API response:", data);

      if (!data.courts || data.courts.length === 0) {
        setError(
          "No courts found matching your criteria. Try broadening your search."
        );
        return;
      }

      setCourts(data.courts);

      // Update map center based on search results
      if (data.courts.length > 0) {
        // Calculate the center point of all courts
        const totalLat = data.courts.reduce(
          (sum: number, court: Court) => sum + court.location.coordinates[1],
          0
        );
        const totalLng = data.courts.reduce(
          (sum: number, court: Court) => sum + court.location.coordinates[0],
          0
        );
        const centerLat = totalLat / data.courts.length;
        const centerLng = totalLng / data.courts.length;

        console.log("Setting map center to average of court locations:", {
          lat: centerLat,
          lng: centerLng,
        });
        setMapCenter({ lat: centerLat, lng: centerLng });

        // Adjust zoom level based on number of courts and search type
        if (data.courts.length === 1) {
          setMapZoom(15); // Zoom in close for single court
        } else if (state || zipCode) {
          setMapZoom(10); // Zoom out more for state/zip searches
        } else {
          setMapZoom(12); // Default zoom for address searches
        }
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setCourts([]);
    setMapCenter(null);
    setMapZoom(4);
    setError(null);
  };

  const value = {
    courts,
    loading,
    error,
    mapCenter,
    mapZoom,
    searchCourts,
    resetSearch,
  };

  return (
    <CourtSearchContext.Provider value={value}>
      {children}
    </CourtSearchContext.Provider>
  );
};
