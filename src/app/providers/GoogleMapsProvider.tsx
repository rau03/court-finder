"use client";

import React, { useState } from "react";
import { LoadScript } from "@react-google-maps/api";

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [loadError, setLoadError] = useState<string | null>(null);

  if (!apiKey) {
    console.warn(
      "Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables."
    );
    return <>{children}</>;
  }

  const handleLoadError = (error: Error) => {
    console.error("Google Maps failed to load:", error);
    setLoadError(error.message);
  };

  const handleLoad = () => {
    console.log("Google Maps loaded successfully");
    setLoadError(null);
  };

  if (loadError) {
    console.warn("Google Maps load error, continuing without maps:", loadError);
    return <>{children}</>;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={["places"]}
      onLoad={handleLoad}
      onError={handleLoadError}
      loadingElement={<div>Loading Google Maps...</div>}
    >
      {children}
    </LoadScript>
  );
};

export default GoogleMapsProvider;
