"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(
  undefined
);

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
};

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === "YOUR_API_KEY") {
      setLoadError(new Error("Google Maps API key is not configured."));
      return;
    }

    // Check if Google Maps JavaScript API is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Function to load the Google Maps JavaScript API
    const loadGoogleMapsApi = () => {
      try {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;

        script.addEventListener("load", () => {
          setIsLoaded(true);
          console.log("Google Maps API loaded successfully");
        });

        script.addEventListener("error", (error) => {
          setLoadError(new Error("Failed to load Google Maps API"));
          console.error("Google Maps loading error:", error);
        });

        document.head.appendChild(script);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error
            : new Error("Unknown error loading Google Maps")
        );
      }
    };

    loadGoogleMapsApi();
  }, []);

  const value = {
    isLoaded,
    loadError,
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
