import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoder";
import { nationalCourtDatabase } from "../../../../lib/nationalCourts";

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export async function GET(request: Request) {
  try {
    console.log("=============== EXTERNAL COURTS API CALLED ===============");
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const maxDistance = parseInt(
      searchParams.get("maxDistance") || "50000",
      10
    );

    console.log(`Searching for courts near: ${address}`);
    console.log(`Max distance: ${maxDistance} meters`);

    if (!address) {
      console.error("No address provided in search params");
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return NextResponse.json(
        { error: "Google Maps API key is not configured" },
        { status: 500 }
      );
    }

    console.log("Google Maps API key is configured");

    // Geocode the address
    const location = await geocodeAddress(address);
    if (!location) {
      console.error("Failed to geocode address:", address);
      return NextResponse.json(
        { error: "Could not geocode address" },
        { status: 400 }
      );
    }

    console.log(`Address geocoded to: ${location.lat}, ${location.lng}`);

    // Search for pickleball courts using various keywords to maximize results
    const radius = Math.min(maxDistance, 50000); // Maximum 50km as per Google's limit
    console.log(`Using search radius: ${radius} meters`);

    // Define multiple search keywords to find more courts
    const searchTerms = [
      "pickleball court",
      "pickleball",
      "pickleball courts",
      "recreational center pickleball",
      "community center pickleball",
      "tennis pickleball",
      "YMCA pickleball",
      "parks and recreation pickleball",
      "sports complex",
      "tennis center",
      "recreation center",
    ];

    console.log(`Will search for ${searchTerms.length} different keywords`);

    // Try a direct search for Orlando pickleball courts first (hardcoded for testing)
    if (
      address.toLowerCase().includes("orlando") ||
      address.toLowerCase().includes("florida") ||
      address.toLowerCase().includes("fl")
    ) {
      console.log("Orlando area detected - adding direct text search");
      try {
        const directTextSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=pickleball+courts+in+orlando&key=${apiKey}`;
        const directResponse = await fetch(directTextSearchUrl);
        console.log(
          "Direct text search response status:",
          directResponse.status
        );
        const directData = await directResponse.json();
        console.log("Direct text search status:", directData.status);
        console.log(
          `Direct text search found ${directData.results?.length || 0} results`
        );

        // Log the first few results
        if (directData.results && directData.results.length > 0) {
          console.log(
            "Sample results:",
            directData.results.slice(0, 3).map((r: { name: string }) => r.name)
          );
        }
      } catch (error) {
        console.error("Error in direct text search:", error);
      }
    }

    // Execute searches for all keywords in parallel
    const searchPromises = searchTerms.map(async (term) => {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
        location.lat
      },${location.lng}&radius=${radius}&keyword=${encodeURIComponent(
        term
      )}&key=${apiKey}`;
      console.log(`Searching for: ${term}`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(
            `API request failed for term "${term}":`,
            response.status,
            response.statusText
          );
          return [];
        }

        const data = await response.json();

        if (data.status === "ZERO_RESULTS") {
          console.log(`No results for: ${term}`);
          return [];
        }

        if (data.status !== "OK") {
          console.error(
            `API error for term "${term}":`,
            data.status,
            data.error_message || "No error message"
          );
          return [];
        }

        console.log(`Found ${data.results?.length || 0} results for: ${term}`);
        if (data.results && Array.isArray(data.results)) {
          // Log the first result for debugging
          if (data.results.length > 0) {
            console.log(`First result for "${term}":`, {
              name: data.results[0].name,
              vicinity: data.results[0].vicinity,
            });
          }
          return data.results as PlaceResult[];
        }
      } catch (error) {
        console.error(`Error searching for "${term}":`, error);
      }
      return [];
    });

    // Wait for all searches to complete
    const resultsArray = await Promise.all(searchPromises);

    // Combine and deduplicate results
    const placeIdsSet = new Set<string>();
    const uniqueResults: PlaceResult[] = [];

    resultsArray.flat().forEach((place) => {
      if (place && place.place_id && !placeIdsSet.has(place.place_id)) {
        placeIdsSet.add(place.place_id);
        uniqueResults.push(place);
      }
    });

    console.log(`Total unique places found: ${uniqueResults.length}`);

    // If no results found with keywords, try one more general search
    if (uniqueResults.length === 0) {
      console.log("No results found with keywords, trying general text search");
      try {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=pickleball+courts+near+${encodeURIComponent(
          address
        )}&key=${apiKey}`;
        console.log("Text search URL:", url);
        const response = await fetch(url);
        console.log("Text search response status:", response.status);

        if (!response.ok) {
          console.error(
            "Text search API request failed:",
            response.status,
            response.statusText
          );
        } else {
          const data = await response.json();
          console.log("Text search API status:", data.status);
          console.log(`Text search found ${data.results?.length || 0} results`);

          if (data.results && Array.isArray(data.results)) {
            // Log the first few results
            if (data.results.length > 0) {
              console.log(
                "Text search sample results:",
                data.results.slice(0, 3).map((r: { name: string }) => r.name)
              );
            }

            data.results.forEach((place: PlaceResult) => {
              if (place && place.place_id && !placeIdsSet.has(place.place_id)) {
                placeIdsSet.add(place.place_id);
                uniqueResults.push(place);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error in text search:", error);
      }
    }

    // Try one last method - findplacefromtext
    if (uniqueResults.length === 0) {
      console.log("Still no results, trying findplacefromtext API");
      try {
        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=pickleball&inputtype=textquery&locationbias=circle:${radius}@${location.lat},${location.lng}&fields=place_id,name,formatted_address,geometry&key=${apiKey}`;
        console.log("Find place URL:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("Find place API status:", data.status);
        console.log(
          `Find place found ${data.candidates?.length || 0} candidates`
        );

        if (data.candidates && Array.isArray(data.candidates)) {
          data.candidates.forEach((place: any) => {
            if (place && place.place_id && !placeIdsSet.has(place.place_id)) {
              uniqueResults.push({
                place_id: place.place_id,
                name: place.name,
                vicinity: place.formatted_address,
                geometry: place.geometry,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error in find place search:", error);
      }
    }

    // Try to find courts from our national database based on geocoded location
    if (uniqueResults.length < 10) {
      console.log("Searching national court database for nearby courts");

      // Get courts from our national database within ~50 miles of the location
      const nearbyNationalCourts = nationalCourtDatabase.filter((court) => {
        // Simple distance calculation (Haversine formula would be more accurate)
        const latDiff = Math.abs(court.location.lat - location.lat);
        const lngDiff = Math.abs(court.location.lng - location.lng);

        // ~0.7 degrees is roughly 50 miles (very approximate)
        return latDiff < 0.7 && lngDiff < 0.7;
      });

      console.log(
        `Found ${nearbyNationalCourts.length} courts in national database near location`
      );

      // Add national courts to our results
      nearbyNationalCourts.forEach((court: any) => {
        const courtResult: PlaceResult = {
          place_id: `nat_${court.id}`,
          name: court.name,
          vicinity: court.address,
          geometry: {
            location: {
              lat: court.location.lat,
              lng: court.location.lng,
            },
          },
        };

        // Check if this court is already in our results
        if (!placeIdsSet.has(courtResult.place_id)) {
          placeIdsSet.add(courtResult.place_id);
          uniqueResults.push(courtResult);
        }
      });
    }

    // Hardcoded fallback for specific cities that need extra help
    if (uniqueResults.length < 5) {
      // Check for Orlando, FL
      if (
        address.toLowerCase().includes("orlando") ||
        (address.toLowerCase().includes("fl") &&
          location.lat > 27.5 &&
          location.lat < 29 &&
          location.lng > -82 &&
          location.lng < -80.5)
      ) {
        console.log("Adding fallback Orlando courts");

        // These are known pickleball locations in Orlando
        const orlandoCourts = [
          {
            place_id: "manual_1",
            name: "Fort Gatlin Recreation Complex",
            vicinity: "2009 Lake Margaret Dr, Orlando, FL 32806",
            geometry: {
              location: {
                lat: 28.5131,
                lng: -81.3571,
              },
            },
          },
          {
            place_id: "manual_2",
            name: "Dover Shores Community Center",
            vicinity: "1400 Gaston Foster Rd, Orlando, FL 32812",
            geometry: {
              location: {
                lat: 28.5249,
                lng: -81.3287,
              },
            },
          },
          {
            place_id: "manual_3",
            name: "Demetree Park",
            vicinity: "955 S Wymore Rd, Winter Park, FL 32789",
            geometry: {
              location: {
                lat: 28.5873,
                lng: -81.3862,
              },
            },
          },
        ];

        orlandoCourts.forEach((court) => {
          // Avoid duplicates
          if (!placeIdsSet.has(court.place_id)) {
            placeIdsSet.add(court.place_id);
            uniqueResults.push(court as PlaceResult);
          }
        });

        console.log("Added fallback courts for Orlando");
      }

      // Check for Miami, FL
      if (
        address.toLowerCase().includes("miami") ||
        (address.toLowerCase().includes("fl") &&
          location.lat > 25 &&
          location.lat < 26 &&
          location.lng > -81 &&
          location.lng < -80)
      ) {
        console.log("Adding fallback Miami courts");

        const miamiCourts = [
          {
            place_id: "manual_miami_1",
            name: "Tropical Park Pickleball Courts",
            vicinity: "7900 SW 40th St, Miami, FL 33155",
            geometry: {
              location: {
                lat: 25.7336,
                lng: -80.323,
              },
            },
          },
          {
            place_id: "manual_miami_2",
            name: "Kendall Indian Hammocks Park",
            vicinity: "11395 SW 79th St, Miami, FL 33173",
            geometry: {
              location: {
                lat: 25.6951,
                lng: -80.3783,
              },
            },
          },
        ];

        miamiCourts.forEach((court: any) => {
          if (!placeIdsSet.has(court.place_id)) {
            placeIdsSet.add(court.place_id);
            uniqueResults.push(court as PlaceResult);
          }
        });
      }

      // Check for Los Angeles, CA
      if (
        address.toLowerCase().includes("los angeles") ||
        address.toLowerCase().includes("la") ||
        (address.toLowerCase().includes("ca") &&
          location.lat > 33.5 &&
          location.lat < 34.5 &&
          location.lng > -119 &&
          location.lng < -117)
      ) {
        console.log("Adding fallback LA courts");

        const laCourts = [
          {
            place_id: "manual_la_1",
            name: "Venice Beach Recreation Center",
            vicinity: "1800 Ocean Front Walk, Venice, CA 90291",
            geometry: {
              location: {
                lat: 33.985,
                lng: -118.4695,
              },
            },
          },
          {
            place_id: "manual_la_2",
            name: "Poinsettia Recreation Center",
            vicinity: "7341 Willoughby Ave, Los Angeles, CA 90046",
            geometry: {
              location: {
                lat: 34.086,
                lng: -118.3491,
              },
            },
          },
        ];

        laCourts.forEach((court: any) => {
          if (!placeIdsSet.has(court.place_id)) {
            placeIdsSet.add(court.place_id);
            uniqueResults.push(court as PlaceResult);
          }
        });
      }
    }

    // Transform Google Places results to match our court schema
    const courts = uniqueResults.map((place) => ({
      _id: `gp_${place.place_id}`,
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity || "Address unavailable",
      // Include placeholder values for required fields
      state: "",
      zipCode: "",
      indoor: false, // Default to outdoor
      numberOfCourts: 1, // Default to 1
      location: {
        type: "Point",
        coordinates: [place.geometry.location.lng, place.geometry.location.lat],
      },
      isVerified: false,
      addedByUser: false,
      source: "google_places",
      lastVerified: new Date(),
    }));

    console.log(`Returning ${courts.length} courts from external search`);
    return NextResponse.json(courts);
  } catch (error) {
    console.error("External search error:", error);
    return NextResponse.json(
      { error: "Failed to search external courts" },
      { status: 500 }
    );
  }
}
