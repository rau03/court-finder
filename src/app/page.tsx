"use client";

import { useState, useEffect } from "react";
import Map from "./components/Map";
import TestMap from "./components/TestMap";
import GoogleMapsWrapper from "./components/GoogleMapsWrapper";

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
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [apiTestResult, setApiTestResult] = useState<string>("");
  const [apiKeyStatus, setApiKeyStatus] = useState<string>("");

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const apiKeyStatus = apiKey
      ? `Present (Length: ${apiKey.length})`
      : "Missing";
    setApiKeyStatus(apiKeyStatus);

    console.log("Environment check:", {
      apiKey: apiKeyStatus,
      isBrowser: typeof window !== "undefined",
      isServer: typeof window === "undefined",
    });
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
    if (!address.trim() && !state && !zipCode.trim() && indoor === null) {
      setError(
        "Please enter an address, select a state, enter a zip code, or filter by indoor/outdoor"
      );
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo("");

    try {
      // Build the query URL with all search parameters
      const params = new URLSearchParams();
      if (address.trim()) params.append("address", address);
      if (state) params.append("state", state);
      if (zipCode.trim()) params.append("zipCode", zipCode);
      if (indoor !== null) params.append("indoor", indoor);
      if (maxDistance) params.append("maxDistance", maxDistance);

      const url = `/api/courts?${params.toString()}`;
      console.log("Searching:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch courts");
      }
      const data = await response.json();

      // Debug: Log the first court to check its structure
      if (data.length > 0) {
        console.log("First court data:", data[0]);
        setDebugInfo(
          `Found ${data.length} courts. First court: ${data[0].name}`
        );
      } else {
        setDebugInfo("No courts found matching your criteria.");
      }

      setCourts(data);

      // If address is provided, update map center
      if (address.trim()) {
        try {
          const geocodeResponse = await fetch(
            `/api/geocode?address=${encodeURIComponent(address)}`
          );
          if (geocodeResponse.ok) {
            const location = await geocodeResponse.json();
            console.log("Geocoded location:", location);

            if (location) {
              setMapCenter(location);
              setMapZoom(12); // Zoom in when an address is provided
            }
          } else {
            console.error("Geocoding failed:", await geocodeResponse.text());
          }
        } catch (geoError) {
          console.error("Geocoding error:", geoError);
        }
      } else {
        // Reset to default center if no address
        setMapCenter(null);
        setMapZoom(4);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testGoogleMapsApi = async () => {
    try {
      setApiTestResult("Testing API key...");
      const response = await fetch("/api/test-maps");
      const data = await response.json();

      if (data.status === "success") {
        setApiTestResult(`API test successful: ${data.message}`);
      } else {
        setApiTestResult(`API test failed: ${data.message}`);
      }
    } catch (error) {
      setApiTestResult(
        `API test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

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
    <GoogleMapsWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
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
                          <span className="font-semibold text-black">
                            State:
                          </span>{" "}
                          <span className="text-black">{court.state}</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <span className="font-semibold text-black">
                            Type:
                          </span>{" "}
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
    </GoogleMapsWrapper>
  );
}
