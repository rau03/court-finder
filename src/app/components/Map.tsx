"use client";

import { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import Map from "../components/Map";

interface MarkerData {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
}

interface MapProps {
  markers?: MarkerData[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const defaultCenter = { lat: 39.8283, lng: -98.5795 }; // Center of USA
const defaultZoom = 4;

const Map: React.FC<MapProps> = ({
  markers = [],
  center = defaultCenter,
  zoom = defaultZoom,
}) => {
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}`}
          position={marker.position}
          onClick={() => setSelectedMarker(marker)}
          icon={{
            path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
            fillColor: "#FF5470",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#000000",
            scale: 2,
            anchor: new google.maps.Point(12, 24),
          }}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2 text-black">
            <h3 className="text-lg font-bold">{selectedMarker.title}</h3>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default Map;
