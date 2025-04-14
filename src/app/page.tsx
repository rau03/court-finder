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

  return (
    <GoogleMapsWrapper>
      <div className="min-h-screen bg-gray-100 flex flex-col p-4">
        <div className="bg-white border-4 border-black p-8 max-w-4xl mx-auto w-full">
          <h1 className="text-4xl font-bold text-black mb-4">
            Pickleball Court Finder USA
          </h1>
          <p className="text-lg text-black mb-6">
            Find pickleball courts anywhere in the United States.
          </p>

          {/* Debug Information */}
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
            <p>API Key Status: {apiKeyStatus}</p>
            <p>
              Environment:{" "}
              <span suppressHydrationWarning>
                {typeof window !== "undefined" ? "Browser" : "Server"}
              </span>
            </p>
            {debugInfo && <p>Debug Info: {debugInfo}</p>}
            {apiTestResult && <p>API Test Result: {apiTestResult}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-black mb-2">Address or City</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or city"
                className="w-full p-2 border-2 border-black text-black"
              />
            </div>

            <div>
              <label className="block text-black mb-2">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 border-2 border-black text-black"
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
              <label className="block text-black mb-2">Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter zip code"
                className="w-full p-2 border-2 border-black text-black"
              />
            </div>

            <div>
              <label className="block text-black mb-2">Court Type</label>
              <select
                value={indoor === null ? "" : indoor}
                onChange={(e) => {
                  const val = e.target.value;
                  setIndoor(val === "" ? null : val);
                }}
                className="w-full p-2 border-2 border-black text-black"
              >
                <option value="">Any</option>
                <option value="true">Indoor</option>
                <option value="false">Outdoor</option>
              </select>
            </div>

            <div>
              <label className="block text-black mb-2">
                Max Distance (if address provided)
              </label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-full p-2 border-2 border-black text-black"
              >
                <option value="5000">5km (~3 miles)</option>
                <option value="10000">10km (~6 miles)</option>
                <option value="25000">25km (~15 miles)</option>
                <option value="50000">50km (~30 miles)</option>
                <option value="100000">100km (~60 miles)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? "Searching..." : "Search Courts"}
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
          {debugInfo && (
            <p className="text-blue-500 mt-2 text-sm">{debugInfo}</p>
          )}
          {apiTestResult && (
            <p className="text-purple-500 mt-2 text-sm">{apiTestResult}</p>
          )}

          {/* Test Google Maps API Button */}
          <div className="mt-4">
            <button
              onClick={testGoogleMapsApi}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Test Google Maps API
            </button>
          </div>

          {/* Test Map for debugging */}
          <div className="mt-4">
            <TestMap />
          </div>

          {courts.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                Found {courts.length} {courts.length === 1 ? "Court" : "Courts"}
                :
              </h2>

              {/* Map Component */}
              <div className="mb-6 border-2 border-gray-300">
                <Map
                  courts={courts}
                  center={mapCenter || undefined}
                  zoom={mapZoom}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courts.map((court) => (
                  <div key={court._id} className="border-2 border-black p-4">
                    <h3 className="font-bold text-xl text-black">
                      {court.name}
                    </h3>
                    <p className="text-black">{court.address}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="text-sm text-black">
                        <span className="font-bold">State:</span> {court.state}
                      </div>
                      <div className="text-sm text-black">
                        <span className="font-bold">Type:</span>{" "}
                        {court.indoor ? "Indoor" : "Outdoor"}
                      </div>
                      <div className="text-sm text-black">
                        <span className="font-bold">Courts:</span>{" "}
                        {court.numberOfCourts}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !loading &&
            !error &&
            courts.length === 0 && (
              <p className="text-center mt-8 text-black">
                No courts found. Try adjusting your search.
              </p>
            )
          )}
        </div>
      </div>
    </GoogleMapsWrapper>
  );
}
