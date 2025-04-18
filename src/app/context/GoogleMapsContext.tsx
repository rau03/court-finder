"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LoadScript } from "@react-google-maps/api";

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: null,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

let isGoogleMapsLoaded = false;

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState<boolean>(isGoogleMapsLoaded);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    // Already loaded through the provider
    if (isGoogleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    // Check if Google Maps API is already loaded
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      setIsLoaded(true);
      isGoogleMapsLoaded = true;
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existingScript) {
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          setIsLoaded(true);
          isGoogleMapsLoaded = true;
        }
      }, 100);

      return () => {
        clearInterval(checkGoogleMaps);
      };
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    setApiKey(key);
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    isGoogleMapsLoaded = true;
  };

  const handleError = (err: Error) => {
    setLoadError(err);
    console.error("Google Maps loading error:", err);
  };

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {isLoaded ? (
        // API already loaded, just render children
        children
      ) : apiKey ? (
        <LoadScript
          googleMapsApiKey={apiKey}
          onLoad={handleLoad}
          onError={handleError}
          libraries={["places"]}
        >
          {children}
        </LoadScript>
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-700 border border-yellow-400 rounded m-4">
          <h3 className="font-bold">Loading Google Maps...</h3>
        </div>
      )}
    </GoogleMapsContext.Provider>
  );
}
