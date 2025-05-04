"use client";

import { useState, useEffect } from "react";
import { LoadScript } from "@react-google-maps/api";
import PickleballMap from "./Map";

// Libraries to load with Google Maps
const libraries = ["places", "geometry"];

interface MapWrapperProps {
  markers?: Array<{
    position: {
      lat: number;
      lng: number;
    };
    title: string;
  }>;
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  onLoad?: () => void;
}

const MapWrapper: React.FC<MapWrapperProps> = ({
  markers = [],
  center,
  zoom,
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded">
        Google Maps API key is not configured
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      onLoad={() => setIsLoaded(true)}
      onError={(error) => setLoadError(error)}
    >
      {isLoaded ? (
        <PickleballMap markers={markers} center={center} zoom={zoom} />
      ) : loadError ? (
        <div className="p-4 text-red-700 bg-red-100 rounded">
          Error loading maps: {loadError.message}
        </div>
      ) : (
        <div className="p-4 text-gray-700 bg-gray-100 rounded">
          Loading maps...
        </div>
      )}
    </LoadScript>
  );
};

export default MapWrapper;
