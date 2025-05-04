"use client";

import { useLoadScript } from "@react-google-maps/api";
import MapWrapper from "../components/MapWrapper";

// Libraries to load with Google Maps
const libraries = ["places", "geometry"];

interface MapWrapperProps {
  markers: { lat: number; lng: number; [key: string]: unknown }[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export default function MapWrapper({ markers, center, zoom }: MapWrapperProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries as ("places" | "geometry")[],
  });

  if (loadError) {
    return (
      <div className="p-4 text-red-700 bg-red-100 border-2 border-black rounded">
        <h3 className="font-bold">Error loading map</h3>
        <p>{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-4 border-t-4 border-black rounded-full animate-spin"></div>
          <p className="mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  return <MapWrapper markers={markers} center={center} zoom={zoom} />;
}
