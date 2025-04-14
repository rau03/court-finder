"use client";

import { LoadScript } from "@react-google-maps/api";
import { ReactNode, useState } from "react";

interface GoogleMapsWrapperProps {
  children: ReactNode;
}

const GoogleMapsWrapper = ({ children }: GoogleMapsWrapperProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: Error) => {
    console.error("Google Maps API error:", error);
    setError(error.message);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded m-4">
        <h3 className="font-bold">Error loading Google Maps</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">
          API Key:{" "}
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Present" : "Missing"}
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
            ` (Length: ${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.length})`}
        </p>
        <p className="mt-2 text-sm">
          Please make sure you have activated the Maps JavaScript API in your
          Google Cloud Console.
        </p>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      onError={handleError}
    >
      {children}
    </LoadScript>
  );
};

export default GoogleMapsWrapper;
