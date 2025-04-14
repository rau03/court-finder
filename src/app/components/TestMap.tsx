"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const TestMap = () => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [apiKeyInfo, setApiKeyInfo] = useState<string>("Checking...");

  const center = { lat: 40.7128, lng: -74.006 }; // New York City
  const zoom = 12;

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    setApiKeyInfo(apiKey ? `Present (Length: ${apiKey.length})` : "Missing");

    console.log(
      "Test map component rendered with API key:",
      apiKey ? `Present (Length: ${apiKey.length})` : "Missing"
    );
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log("Test map loaded successfully");
  }, []);

  const onError = useCallback((error: Error) => {
    console.error("Google Maps error in test map:", error);

    // Provide more specific guidance based on error type
    if (error.message.includes("ApiNotActivatedMapError")) {
      setMapError(
        "Google Maps JavaScript API is not activated. Please activate it in the Google Cloud Console."
      );
    } else if (error.message.includes("InvalidKeyMapError")) {
      setMapError(
        "Invalid Google Maps API key. Please check your API key configuration."
      );
    } else if (error.message.includes("MissingKeyMapError")) {
      setMapError(
        "Google Maps API key is missing. Please check your environment variables."
      );
    } else {
      setMapError(error.message);
    }
  }, []);

  return (
    <div className="p-4 border-2 border-red-500">
      <h2 className="text-xl font-bold mb-2">Test Map (New York City)</h2>

      {mapError ? (
        <div className="p-2 bg-red-100 text-red-700">
          <p className="font-bold">Error: {mapError}</p>
          <p className="mt-2">API Key: {apiKeyInfo}</p>
          <div className="mt-2 text-sm">
            <p>To fix this issue:</p>
            <ol className="list-decimal pl-5 mt-1">
              <li>
                Go to the{" "}
                <a
                  href="https://console.cloud.google.com/apis/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Google Cloud Console API Library
                </a>
              </li>
              <li>Search for "Maps JavaScript API" and enable it</li>
              <li>Also enable "Geocoding API" and "Places API"</li>
              <li>
                Check your API key restrictions in the Credentials section
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
          >
            <Marker position={center} />
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default TestMap;
