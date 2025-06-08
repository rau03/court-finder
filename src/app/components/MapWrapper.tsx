"use client";

import { useEffect } from "react";

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
  // Suppress unused variable warnings for future map implementation
  void center;
  void zoom;
  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  return (
    <div className="relative flex items-center justify-center w-full h-full border-2 border-gray-300 border-dashed bg-gradient-to-br from-blue-50 to-green-50">
      <div className="p-6 text-center">
        <div className="mb-4 text-6xl">🗺️</div>
        <h3 className="mb-2 text-xl font-bold text-gray-800">
          Court Locations
        </h3>
        <p className="mb-4 text-gray-600">
          {markers.length} court{markers.length !== 1 ? "s" : ""} found
        </p>

        {markers.length > 0 && (
          <div className="space-y-2 overflow-y-auto max-h-40">
            {markers.map((marker, index) => (
              <div
                key={index}
                className="p-3 text-sm bg-white border rounded-lg shadow"
              >
                <div className="font-medium text-gray-800">{marker.title}</div>
                <div className="text-xs text-gray-500">
                  {marker.position.lat.toFixed(4)},{" "}
                  {marker.position.lng.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          Interactive map coming soon
        </div>
      </div>
    </div>
  );
};

export default MapWrapper;
