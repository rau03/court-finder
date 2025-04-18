"use client";

import { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

interface Court {
  _id?: string; // Make _id optional since external courts might not have it
  placeId?: string; // Add placeId for external courts
  name: string;
  address: string;
  state?: string;
  zipCode?: string;
  indoor?: boolean;
  numberOfCourts?: number;
  location: {
    type: "Point";
    coordinates: number[];
  };
}

interface MapProps {
  courts: Court[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const defaultCenter = { lat: 39.8283, lng: -98.5795 }; // Center of USA
const defaultZoom = 4;

const Map: React.FC<MapProps> = ({
  courts,
  center = defaultCenter,
  zoom = defaultZoom,
}) => {
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const onError = useCallback((error: Error) => {
    console.error("Google Maps error:", error);
    setMapError(error.message);

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
    }
  }, []);

  // If there's an error, show a message
  if (mapError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded">
        <h3 className="font-bold">Error loading map</h3>
        <p>{mapError}</p>
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

  // If no courts, show a message
  if (courts.length === 0) {
    return (
      <div className="p-4 bg-gray-100 text-gray-700 border border-gray-400 rounded">
        <p>No courts to display on the map.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px]">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onError={onError}
      >
        {courts.map((court, index) => {
          // Skip courts with invalid coordinates
          if (
            !court.location ||
            !court.location.coordinates ||
            court.location.coordinates.length < 2
          ) {
            console.warn(`Skipping court with invalid coordinates:`, court);
            return null;
          }

          // Generate a unique key for each marker
          const uniqueKey =
            court._id ||
            court.placeId ||
            `court-${index}-${court.name.replace(/\s+/g, "-").toLowerCase()}`;

          return (
            <Marker
              key={uniqueKey}
              position={{
                lat: court.location.coordinates[1],
                lng: court.location.coordinates[0],
              }}
              onClick={() => setSelectedCourt(court)}
            />
          );
        })}

        {selectedCourt &&
          selectedCourt.location &&
          selectedCourt.location.coordinates && (
            <InfoWindow
              position={{
                lat: selectedCourt.location.coordinates[1],
                lng: selectedCourt.location.coordinates[0],
              }}
              onCloseClick={() => setSelectedCourt(null)}
            >
              <div className="text-black">
                <h3 className="font-bold text-lg mb-1">{selectedCourt.name}</h3>
                <p className="mb-2">{selectedCourt.address}</p>
                <div className="text-sm">
                  {selectedCourt.state && (
                    <p>
                      <span className="font-semibold">State:</span>{" "}
                      {selectedCourt.state}
                    </p>
                  )}
                  {selectedCourt.indoor !== undefined && (
                    <p>
                      <span className="font-semibold">Type:</span>{" "}
                      {selectedCourt.indoor ? "Indoor 🏢" : "Outdoor 🌳"}
                    </p>
                  )}
                  {selectedCourt.numberOfCourts && (
                    <p>
                      <span className="font-semibold">Courts:</span>{" "}
                      {selectedCourt.numberOfCourts}
                    </p>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
      </GoogleMap>
    </div>
  );
};

export default Map;
