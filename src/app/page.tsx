"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Map from "./components/Map";
import Link from "next/link";
import Header from "./components/Header";
import CourtCard from "./components/CourtCard";
import { useGoogleMaps } from "./context/GoogleMapsContext";

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

export default function Home() {
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [indoor, setIndoor] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState("50000"); // Default 50km
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState(4);
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps API key is not configured");
    }
  }, []);

  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add "FL" or other state to make the search more specific
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

      // Build the query URL with any provided filters
      const params = new URLSearchParams();
      if (searchAddress) params.append("address", searchAddress);
      if (state) params.append("state", state);
      if (zipCode.trim()) params.append("zipCode", zipCode);
      if (indoor !== null) params.append("indoor", indoor);
      if (maxDistance) params.append("maxDistance", maxDistance);

      // Search local database first
      const localResponse = await fetch(`/api/courts?${params.toString()}`);
      const localData = await localResponse.json();

      let allCourts = localData.courts || [];

      console.log(`Found ${allCourts.length} courts in local database`);

      // If few local results, also check external sources
      if (allCourts.length < 5 && searchAddress) {
        try {
          console.log("Fetching additional courts from external sources");
          const externalResponse = await fetch(
            `/api/courts/external?${params.toString()}`
          );

          if (!externalResponse.ok) {
            const errorData = await externalResponse.json();
            console.error("External API error:", errorData);
          } else {
            const externalCourts = await externalResponse.json();
            console.log(
              `Found ${externalCourts.length} courts from external sources`
            );

            // Filter out duplicates
            if (Array.isArray(externalCourts) && externalCourts.length > 0) {
              externalCourts.forEach((extCourt) => {
                if (!extCourt.location || !extCourt.location.coordinates) {
                  console.warn("External court missing coordinates:", extCourt);
                  return;
                }

                const isDuplicate = allCourts.some((localCourt) =>
                  areLocationsNearby(
                    localCourt.location.coordinates,
                    extCourt.location.coordinates,
                    0.05 // ~50 meters
                  )
                );

                if (!isDuplicate) {
                  allCourts.push(extCourt);
                }
              });
            }
          }
        } catch (externalError) {
          console.error("External search error:", externalError);
        }
      }

      if (allCourts.length > 0) {
        setCourts(allCourts);
        console.log(`Displaying ${allCourts.length} total courts`);
      } else {
        setError("No courts found matching your criteria.");
      }

      // Update map center if address was provided
      if (searchAddress) {
        try {
          const geocodeResponse = await fetch(
            `/api/geocode?address=${encodeURIComponent(searchAddress)}`
          );
          if (geocodeResponse.ok) {
            const location = await geocodeResponse.json();
            if (location) {
              setMapCenter(location);
              setMapZoom(12);
            }
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

  // Helper function to check if two coordinates are nearby
  function areLocationsNearby(coord1, coord2, maxDifference) {
    return (
      Math.abs(coord1[0] - coord2[0]) < maxDifference &&
      Math.abs(coord1[1] - coord2[1]) < maxDifference
    );
  }

  // Add a reset function
  const handleReset = () => {
    setAddress("");
    setState("");
    setZipCode("");
    setIndoor(null);
    setMaxDistance("50000"); // Reset to default distance
    setCourts([]); // Clear results
    setMapCenter(null);
    setMapZoom(10);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Simple Navigation */}
      <div className="bg-white p-4 flex justify-between items-center shadow-md">
        <div className="font-bold text-xl">Pickleball Court Finder</div>
        <div className="flex gap-4">
          <Link
            href="/custom-sign-in"
            className="text-blue-600 hover:underline"
          >
            Sign In
          </Link>
          <Link
            href="/custom-sign-up"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 py-8 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
            Pickleball Court Finder
            <span className="text-blue-900 ml-2">USA</span> 🏓
          </h1>
          <p className="text-xl text-white opacity-90">
            Game on! Find the perfect court near you.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 -mt-8">
        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border-t-4 border-blue-500">
          {/* Search Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-blue-900 font-semibold mb-2">
                Where do you want to play? 🎯
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or city"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 transition duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                State 📍
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 transition duration-200 text-gray-700"
              >
                <option value="">Any State</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                ZIP Code 🔍
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter zip code"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 transition duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                Court Type 🏢
              </label>
              <select
                value={indoor === null ? "" : indoor}
                onChange={(e) => {
                  const val = e.target.value;
                  setIndoor(val === "" ? null : val);
                }}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 transition duration-200 text-gray-700"
              >
                <option value="">Any</option>
                <option value="true">Indoor</option>
                <option value="false">Outdoor</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                Search Range 📏
              </label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 transition duration-200 text-gray-700"
              >
                <option value="5000">5km (~3 miles)</option>
                <option value="10000">10km (~6 miles)</option>
                <option value="25000">25km (~15 miles)</option>
                <option value="50000">50km (~30 miles)</option>
                <option value="100000">100km (~60 miles)</option>
              </select>
            </div>
          </div>

          {/* Buttons Group */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                "Find Courts 🎯"
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-6 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-4 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 border-2 border-gray-300"
            >
              Reset 🔄
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {courts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900">
              🎉 Found {courts.length}{" "}
              {courts.length === 1 ? "Court" : "Courts"}
            </h2>

            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white">
              <Map
                courts={courts}
                center={mapCenter || undefined}
                zoom={mapZoom}
              />
            </div>

            {/* Court Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {courts.map((court) => (
                <div
                  key={court._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-200 overflow-hidden border-l-4 border-yellow-400"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-xl text-blue-900 mb-2">
                      {court.name}
                    </h3>
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
                      <div className="bg-yellow-50 rounded-lg p-2 col-span-2">
                        <span className="font-semibold text-black">
                          Courts:
                        </span>{" "}
                        <span className="text-black">
                          {court.numberOfCourts}{" "}
                          {court.numberOfCourts === 1 ? "Court" : "Courts"} 🏓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && courts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No courts found. Try adjusting your search! 🔍
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
