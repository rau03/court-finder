"use client";

import { useState } from "react";

interface Court {
  name: string;
  address: string;
  state: string;
  zipCode: string;
  indoor: boolean;
  numberOfCourts: number;
  amenities: {
    lightsAvailable: boolean;
    restroomsAvailable: boolean;
    waterFountain: boolean;
  };
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface FetchResponse {
  success: boolean;
  message: string;
  courts: Court[];
}

export default function TestCourts() {
  const [lat, setLat] = useState("37.7749"); // Default to San Francisco
  const [lng, setLng] = useState("-122.4194");
  const [radius, setRadius] = useState("10");
  const [results, setResults] = useState<FetchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `/api/courts/fetch?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch courts");
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        input[type="number"] {
          color: white !important;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
      <div className="container p-4 mx-auto text-white">
        <h1 className="mb-4 text-2xl font-bold">Test Court Fetching</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Radius (km)
              </label>
              <input
                type="number"
                step="any"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 border-gray-600"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Fetching..." : "Fetch Courts"}
          </button>
        </form>

        {error && (
          <div className="p-4 mb-4 text-red-300 bg-red-900/50 border border-red-500 rounded">
            {error}
          </div>
        )}

        {results && (
          <div>
            <h2 className="mb-2 text-xl font-semibold">Results</h2>
            <p className="mb-4">{results.message}</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.courts.map((court, index) => (
                <div
                  key={index}
                  className="p-4 border rounded bg-gray-800/50 border-gray-600"
                >
                  <h3 className="font-semibold">{court.name}</h3>
                  <p className="text-sm text-gray-300">{court.address}</p>
                  <div className="mt-2 text-sm">
                    <p>State: {court.state || "N/A"}</p>
                    <p>Zip: {court.zipCode || "N/A"}</p>
                    <p>Indoor: {court.indoor ? "Yes" : "No"}</p>
                    <p>Number of Courts: {court.numberOfCourts}</p>
                    <div className="mt-1">
                      <p>Amenities:</p>
                      <ul className="list-disc list-inside">
                        <li>
                          Lights:{" "}
                          {court.amenities.lightsAvailable ? "Yes" : "No"}
                        </li>
                        <li>
                          Restrooms:{" "}
                          {court.amenities.restroomsAvailable ? "Yes" : "No"}
                        </li>
                        <li>
                          Water: {court.amenities.waterFountain ? "Yes" : "No"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
