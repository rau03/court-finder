import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { OverpassClient } from "@/lib/overpass-client";
import {
  createOptimizedQuery,
  calculateBounds,
  Bounds,
} from "@/lib/overpass-query";
import { OverpassCache } from "@/lib/overpass-cache";
import { geocodeAddress } from "@/lib/geocoder";

// Add this line to mark the route as dynamic
export const dynamic = "force-dynamic";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Initialize Overpass components
const overpassClient = new OverpassClient();
const cache = new OverpassCache();

interface OSMNode {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    sport?: string;
    leisure?: string;
    indoor?: string;
    courts?: string;
    lit?: string;
    toilets?: string;
    drinking_water?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    "addr:city"?: string;
    "addr:state"?: string;
    "addr:postcode"?: string;
    description?: string;
  };
}

interface OSMWay {
  type: "way";
  id: number;
  nodes: number[];
  tags?: {
    name?: string;
    sport?: string;
    leisure?: string;
    indoor?: string;
    courts?: string;
    lit?: string;
    toilets?: string;
    drinking_water?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    "addr:city"?: string;
    "addr:state"?: string;
    "addr:postcode"?: string;
    description?: string;
  };
}

type OSMElement = OSMNode | OSMWay;

interface OSMResponse {
  elements: OSMElement[];
}

interface Court {
  name: string;
  address: string;
  state: string;
  zipCode: string;
  indoor: boolean;
  numberOfCourts: number;
  amenities: {
    lightsAvailable: boolean;
    restroomsAvailable: boolean;
    waterFountain: boolean;
  };
  location: {
    type: "Point";
    coordinates: number[];
  };
  isVerified: boolean;
  addedByUser: boolean;
  lastVerified: number;
  createdAt: number;
  updatedAt: number;
  submittedBy: string;
}

// Function to process OSM data into our court format
function processOSMData(osmData: OSMResponse): Court[] {
  const courts: Court[] = [];
  console.log("Processing OSM data with", osmData.elements.length, "elements");

  // Process nodes (point locations)
  osmData.elements
    .filter((element): element is OSMNode => element.type === "node")
    .forEach((node) => {
      if (node.tags) {
        console.log("Processing node:", {
          id: node.id,
          name: node.tags.name,
          sport: node.tags.sport,
          leisure: node.tags.leisure,
          description: node.tags.description,
        });

        const isSportsFacility =
          node.tags.leisure === "sports_centre" ||
          node.tags.leisure === "pitch" ||
          node.tags.leisure === "stadium" ||
          node.tags.leisure === "fitness_centre" ||
          node.tags.leisure === "park" ||
          node.tags.amenity === "community_centre";

        const mentionsPickleball =
          node.tags.name?.toLowerCase().includes("pickleball") ||
          node.tags.description?.toLowerCase().includes("pickleball") ||
          node.tags.sport === "pickleball";

        const mentionsTennis =
          node.tags.name?.toLowerCase().includes("tennis") ||
          node.tags.description?.toLowerCase().includes("tennis") ||
          node.tags.sport === "tennis";

        const mentionsCourts =
          node.tags.name?.toLowerCase().includes("court") ||
          node.tags.description?.toLowerCase().includes("court");

        if (
          isSportsFacility ||
          mentionsPickleball ||
          mentionsTennis ||
          mentionsCourts
        ) {
          console.log("Found potential court node:", {
            id: node.id,
            name: node.tags.name,
            sport: node.tags.sport,
            leisure: node.tags.leisure,
            description: node.tags.description,
            reason: mentionsPickleball
              ? "pickleball"
              : mentionsTennis
                ? "tennis"
                : mentionsCourts
                  ? "court"
                  : "sports facility",
          });

          const street = node.tags["addr:street"] ?? "";
          const houseNumber = node.tags["addr:housenumber"] ?? "";
          const address = street
            ? `${houseNumber} ${street}`.trim()
            : "Address not available";

          const court: Court = {
            name: node.tags.name ?? "Unnamed Sports Facility",
            address,
            state: node.tags["addr:state"] ?? "",
            zipCode: node.tags["addr:postcode"] ?? "",
            indoor: node.tags.indoor === "yes",
            numberOfCourts: parseInt(node.tags.courts ?? "1"),
            amenities: {
              lightsAvailable: node.tags.lit === "yes",
              restroomsAvailable: node.tags.toilets === "yes",
              waterFountain: node.tags.drinking_water === "yes",
            },
            location: {
              type: "Point" as const,
              coordinates: [node.lon, node.lat],
            },
            isVerified: false,
            addedByUser: false,
            lastVerified: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            submittedBy: "osm",
          };

          courts.push(court);
        }
      }
    });

  // Process ways (areas)
  const wayNodes = new Map<number, OSMNode>();
  osmData.elements
    .filter((element): element is OSMNode => element.type === "node")
    .forEach((node) => {
      wayNodes.set(node.id, node);
    });

  osmData.elements
    .filter((element): element is OSMWay => element.type === "way")
    .forEach((way) => {
      if (way.tags) {
        console.log("Processing way:", {
          id: way.id,
          name: way.tags.name,
          sport: way.tags.sport,
          leisure: way.tags.leisure,
          description: way.tags.description,
        });

        const isSportsFacility =
          way.tags.leisure === "sports_centre" ||
          way.tags.leisure === "pitch" ||
          way.tags.leisure === "stadium" ||
          way.tags.leisure === "fitness_centre";

        const mentionsPickleball =
          way.tags.name?.toLowerCase().includes("pickleball") ||
          way.tags.description?.toLowerCase().includes("pickleball") ||
          way.tags.sport === "pickleball";

        const mentionsTennis =
          way.tags.name?.toLowerCase().includes("tennis") ||
          way.tags.description?.toLowerCase().includes("tennis") ||
          way.tags.sport === "tennis";

        const mentionsCourts =
          way.tags.name?.toLowerCase().includes("court") ||
          way.tags.description?.toLowerCase().includes("court");

        if (
          isSportsFacility ||
          mentionsPickleball ||
          mentionsTennis ||
          mentionsCourts
        ) {
          console.log("Found potential court way:", {
            id: way.id,
            name: way.tags.name,
            sport: way.tags.sport,
            leisure: way.tags.leisure,
            description: way.tags.description,
            reason: mentionsPickleball
              ? "pickleball"
              : mentionsTennis
                ? "tennis"
                : mentionsCourts
                  ? "court"
                  : "sports facility",
          });

          // Calculate center point of the way
          const nodes = way.nodes
            .map((id) => wayNodes.get(id))
            .filter((node): node is OSMNode => node !== undefined);

          if (nodes.length > 0) {
            const center = nodes.reduce(
              (acc, node) => ({
                lat: acc.lat + node.lat / nodes.length,
                lon: acc.lon + node.lon / nodes.length,
              }),
              { lat: 0, lon: 0 }
            );

            const street = way.tags["addr:street"] ?? "";
            const houseNumber = way.tags["addr:housenumber"] ?? "";
            const address = street
              ? `${houseNumber} ${street}`.trim()
              : "Address not available";

            const court: Court = {
              name: way.tags.name ?? "Unnamed Sports Facility",
              address,
              state: way.tags["addr:state"] ?? "",
              zipCode: way.tags["addr:postcode"] ?? "",
              indoor: way.tags.indoor === "yes",
              numberOfCourts: parseInt(way.tags.courts ?? "1"),
              amenities: {
                lightsAvailable: way.tags.lit === "yes",
                restroomsAvailable: way.tags.toilets === "yes",
                waterFountain: way.tags.drinking_water === "yes",
              },
              location: {
                type: "Point" as const,
                coordinates: [center.lon, center.lat],
              },
              isVerified: false,
              addedByUser: false,
              lastVerified: Date.now(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
              submittedBy: "osm",
            };

            courts.push(court);
          }
        }
      }
    });

  console.log("Found", courts.length, "courts after processing");
  return courts;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "20");

    // Calculate bounds using the imported function
    const bounds = calculateBounds(lat, lng, radius);
    console.log("Search parameters:", { lat, lng, radius });
    console.log("Calculated bounds:", bounds);

    // Try to get from cache first
    const cacheKey = JSON.stringify(bounds);
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log("Retrieved data from cache");
      return NextResponse.json({
        success: true,
        message: "Data retrieved from cache",
        courts: cachedData,
      });
    }

    console.log("Cache miss, fetching from Overpass API");

    // Create and execute Overpass query
    const query = createOptimizedQuery(bounds);
    console.log("Generated Overpass query:", query);

    const osmData = await overpassClient.executeQuery(query);
    console.log("Received response from Overpass API");

    const courts = processOSMData(osmData);
    console.log(`Processed ${courts.length} courts from OSM data`);

    // Cache the results
    cache.set(cacheKey, courts);
    console.log("Cached results for future requests");

    // Save courts to Convex
    if (courts.length > 0) {
      console.log("Saving courts to Convex database");
      await convex.mutation(api.courts.importExternalCourts, {
        courts: courts.map((court) => ({
          ...court,
          isVerified: false,
          addedByUser: false,
          lastVerified: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          submittedBy: "osm",
        })),
      });
      console.log("Successfully saved courts to Convex");
    }

    // Get metrics for monitoring
    const metrics = overpassClient.getMetrics();
    console.log("Overpass API metrics:", metrics);

    return NextResponse.json({
      success: true,
      message: `Found ${courts.length} courts`,
      courts,
      metrics,
    });
  } catch (error) {
    console.error("Error in court fetch request:", error);

    // Get metrics even in case of error
    const metrics = overpassClient.getMetrics();
    console.error("Overpass API metrics at time of error:", metrics);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courts",
        details: error instanceof Error ? error.message : "Unknown error",
        metrics,
      },
      { status: 500 }
    );
  }
}
