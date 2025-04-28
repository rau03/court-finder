"use client";

import { useEffect } from "react";
import { useGoogleMaps } from "../../context/GoogleMapsContext";
import Map from "../../components/Map";

export default function TestMapPage() {
  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    if (loadError) {
      console.error("Google Maps error:", loadError);
    }
  }, [isLoaded, loadError]);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Google Maps Test Page</h1>

      <div className="h-[500px] border-2 border-black mb-6 overflow-hidden">
        {!isLoaded ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            <p>Loading Google Maps...</p>
          </div>
        ) : loadError ? (
          <div className="flex items-center justify-center w-full h-full bg-red-100">
            <p>Error: {loadError.message}</p>
          </div>
        ) : (
          <Map markers={[]} center={{ lat: 39.8283, lng: -98.5795 }} zoom={4} />
        )}
      </div>

      <div className="p-4 border-2 border-black">
        <h2 className="mb-4 text-xl font-bold">Debug Information:</h2>
        <p>Google Maps API initialized: {isLoaded ? "Yes" : "No"}</p>
        <p>Error: {loadError ? loadError.message : "None"}</p>
      </div>

      <div className="mt-6">
        <a href="/" className="text-blue-500 hover:underline">
          Back to home
        </a>
      </div>
    </div>
  );
}
