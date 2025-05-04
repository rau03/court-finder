"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { SearchParams } from "../components/SearchForm";

interface Court {
  _id: string;
  name: string;
  address: string;
  state: string;
  zipCode: string;
  indoor: boolean;
  numberOfCourts: number;
  location: {
    type: "Point";
    coordinates: number[];
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

  // Helper function to check if two coordinates are nearby
  function areLocationsNearby(
    coord1: number[],
    coord2: number[],
    maxDifference: number
  ): boolean {
    return (
      Math.abs(coord1[0] - coord2[0]) < maxDifference &&
      Math.abs(coord1[1] - coord2[1]) < maxDifference
    );
  }

  const searchCourts = async (searchParams: SearchParams) => {
    setLoading(true);
    setError(null);
    setCourts([]); // Clear previous results

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

      // Build the query URL with any provided filters
      const params = new URLSearchParams();
      if (searchAddress) params.append("address", searchAddress);
      if (state) params.append("state", state);
      if (zipCode.trim()) params.append("zipCode", zipCode);
      if (indoor !== null) params.append("indoor", indoor);
      if (maxDistance) params.append("maxDistance", maxDistance);

      console.log("Search parameters:", Object.fromEntries(params.entries()));

      // Search local database first
      console.log("Searching local database...");
      const localResponse = await fetch(`/api/courts?${params.toString()}`);
      if (!localResponse.ok) {
        const errorText = await localResponse.text();
        console.error("Local search error:", errorText);
        setError("Error searching local database");
        setLoading(false);
        return;
      }

      const localData = await localResponse.json();
      const allCourts = localData.courts || [];

      console.log(`Found ${allCourts.length} courts in local database`);

      // Always check external sources regardless of local results
      // This ensures we find as many courts as possible
      if (searchAddress) {
        try {
          console.log("Fetching additional courts from external sources");
          const externalResponse = await fetch(
            `/api/courts/external?${params.toString()}`
          );

          if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            console.error("External API error:", errorText);
          } else {
            const externalCourts = await externalResponse.json();
            console.log(
              `Found ${externalCourts.length} courts from external sources`
            );

            // Log the first few external courts for debugging
            if (externalCourts.length > 0) {
              console.log(
                "Sample external courts:",
                externalCourts.slice(0, 3).map((court: Court) => court.name)
              );
            }

            // Filter out duplicates
            if (Array.isArray(externalCourts) && externalCourts.length > 0) {
              let addedCount = 0;
              externalCourts.forEach((extCourt) => {
                if (!extCourt.location || !extCourt.location.coordinates) {
                  console.warn("External court missing coordinates:", extCourt);
                  return;
                }

                const isDuplicate = allCourts.some((localCourt: Court) =>
                  areLocationsNearby(
                    localCourt.location.coordinates,
                    extCourt.location.coordinates,
                    0.01 // ~10 meters - reduced from 0.05 (~50 meters) to find more courts
                  )
                );

                if (!isDuplicate) {
                  allCourts.push(extCourt);
                  addedCount++;
                }
              });
              console.log(
                `Added ${addedCount} unique courts from external sources`
              );
            }
          }
        } catch (externalError) {
          console.error("External search error:", externalError);
        }
      }

      // Check if we have any courts to display
      if (allCourts.length > 0) {
        console.log(`Displaying ${allCourts.length} total courts`);
        setCourts(allCourts);
      } else {
        // Provide a more helpful error message
        let errorMsg = "No courts found matching your criteria.";
        if (searchAddress.toLowerCase().includes("orlando")) {
          errorMsg +=
            " We are working on adding more courts in the Orlando area.";
        } else {
          errorMsg +=
            " Try broadening your search by increasing the distance or changing your search terms.";
        }
        setError(errorMsg);
      }

      // Update map center if address was provided
      if (searchAddress) {
        try {
          console.log("Updating map center for address:", searchAddress);
          const geocodeResponse = await fetch(
            `/api/geocode?address=${encodeURIComponent(searchAddress)}`
          );
          if (geocodeResponse.ok) {
            const location = await geocodeResponse.json();
            if (location) {
              console.log("Setting map center to:", location);
              setMapCenter(location);
              setMapZoom(12);
            } else {
              console.warn("Geocode response OK but no location data returned");
            }
          } else {
            console.error("Geocode error:", await geocodeResponse.text());
          }
        } catch (geoError) {
          console.error("Geocoding error:", geoError);
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
