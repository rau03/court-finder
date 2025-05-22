import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

// Add this line to mark the route as dynamic
export const dynamic = "force-dynamic";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Overpass API endpoint
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

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
    indoorCourts: boolean;
    outdoorCourts: boolean;
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

// Function to create Overpass QL query for pickleball courts
function createOverpassQuery(bounds: Bounds): string {
  return `
    [out:json][timeout:25];
    (
      // Get all sports facilities and courts
      node["leisure"="sports_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["leisure"="pitch"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["leisure"="stadium"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["leisure"="fitness_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["leisure"="sports_centre"]["sport"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["leisure"="pitch"]["sport"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      
      // Get all ways (areas) for sports facilities
      way["leisure"="sports_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="pitch"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="stadium"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="fitness_centre"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="sports_centre"]["sport"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"="pitch"]["sport"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      
      // Get any nodes or ways that mention pickleball or tennis
      node["name"~"pickleball|tennis|court",i](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["name"~"pickleball|tennis|court",i](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["description"~"pickleball|tennis|court",i](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["description"~"pickleball|tennis|court",i](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      
      // Get any nodes or ways with sport tags
      node["sport"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["sport"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      
      // Get the nodes that make up the ways
      >;
    );
  `;
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
          node.tags.leisure === "fitness_centre";

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
          (mentionsTennis && mentionsCourts)
        ) {
          console.log("Found potential court node:", {
            id: node.id,
            name: node.tags.name,
            sport: node.tags.sport,
            leisure: node.tags.leisure,
            description: node.tags.description,
            reason: mentionsPickleball
              ? "pickleball"
              : mentionsTennis && mentionsCourts
                ? "tennis court"
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
              indoorCourts: node.tags.indoor === "yes",
              outdoorCourts: node.tags.indoor !== "yes",
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
          (mentionsTennis && mentionsCourts)
        ) {
          console.log("Found potential court way:", {
            id: way.id,
            name: way.tags.name,
            sport: way.tags.sport,
            leisure: way.tags.leisure,
            description: way.tags.description,
            reason: mentionsPickleball
              ? "pickleball"
              : mentionsTennis && mentionsCourts
                ? "tennis court"
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
                indoorCourts: way.tags.indoor === "yes",
                outdoorCourts: way.tags.indoor !== "yes",
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
    console.log("Starting court fetch request...");

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "10");

    console.log("Request parameters:", { lat, lng, radius });

    // Verify Convex URL is set
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    }
    console.log("Convex URL is configured");

    // Add a test court that exactly matches the Convex schema
    const testCourt = {
      name: "Test Pickleball Court",
      address: "123 Test Street",
      state: "CA",
      zipCode: "94105",
      indoor: false,
      numberOfCourts: 2,
      amenities: {
        indoorCourts: false,
        outdoorCourts: true,
        lightsAvailable: true,
        restroomsAvailable: true,
        waterFountain: true,
      },
      location: {
        type: "Point" as const,
        coordinates: [parseFloat(lng.toString()), parseFloat(lat.toString())],
      },
      isVerified: false,
      addedByUser: false,
      lastVerified: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedBy: "system",
    };

    console.log(
      "Test court object created:",
      JSON.stringify(testCourt, null, 2)
    );

    try {
      console.log("Attempting to save test court to Convex...");
      const result = await convex.mutation(api.courts.submitCourt, {
        name: testCourt.name,
        address: testCourt.address,
        state: testCourt.state,
        zipCode: testCourt.zipCode,
        indoor: testCourt.indoor,
        numberOfCourts: testCourt.numberOfCourts,
        amenities: testCourt.amenities,
        location: testCourt.location,
      });
      console.log("Successfully saved test court to Convex:", result);
    } catch (error) {
      console.error("Error saving to Convex:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      throw error;
    }

    // Calculate bounding box
    const bounds = {
      minLat: lat - radius / 111.32,
      maxLat: lat + radius / 111.32,
      minLon: lng - radius / (111.32 * Math.cos((lat * Math.PI) / 180)),
      maxLon: lng + radius / (111.32 * Math.cos((lat * Math.PI) / 180)),
    };

    console.log("Bounding box calculated:", bounds);

    // Create and execute Overpass query
    const query = createOverpassQuery(bounds);
    console.log("Overpass query created:", query);

    try {
      console.log("Sending request to Overpass API...");
      const response = await fetch(OVERPASS_API, {
        method: "POST",
        body: query,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Overpass API error response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `Overpass API error: ${response.statusText} - ${errorText}`
        );
      }

      const osmData = await response.json();
      console.log("Overpass API response received:", {
        elementCount: osmData.elements?.length || 0,
        firstElement: osmData.elements?.[0],
      });

      const courts = processOSMData(osmData);
      console.log("Processed courts:", {
        count: courts.length,
        firstCourt: courts[0],
      });

      // Save courts to Convex
      if (courts.length > 0) {
        try {
          console.log("Attempting to save processed courts to Convex...");
          for (const court of courts) {
            const result = await convex.mutation(api.courts.submitCourt, {
              name: court.name,
              address: court.address,
              state: court.state,
              zipCode: court.zipCode,
              indoor: court.indoor,
              numberOfCourts: court.numberOfCourts,
              amenities: court.amenities,
              location: court.location,
            });
            console.log("Successfully saved court to Convex:", result);
          }
        } catch (error) {
          console.error("Error saving processed courts to Convex:", error);
          if (error instanceof Error) {
            console.error("Error details:", {
              message: error.message,
              stack: error.stack,
              name: error.name,
            });
          }
          throw error;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Found ${courts.length} courts`,
        courts: [testCourt, ...courts],
        debug: {
          bounds,
          query,
          elementCount: osmData.elements?.length || 0,
          sampleElements: osmData.elements?.slice(0, 2),
        },
      });
    } catch (error) {
      console.error("Error in Overpass API request:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in court fetch request:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courts",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
