import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper function to check if user is admin
async function checkIsAdmin(ctx: { db: any; auth: any }): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return false;
  }

  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("clerkId"), identity.tokenIdentifier))
    .first();

  return user?.role === "admin";
}

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Submit a new court
export const submitCourt = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.optional(v.string()),
    state: v.string(),
    zipCode: v.string(),
    indoor: v.boolean(),
    numberOfCourts: v.number(),
    amenities: v.object({
      indoorCourts: v.boolean(),
      outdoorCourts: v.boolean(),
      lightsAvailable: v.boolean(),
      restroomsAvailable: v.boolean(),
      waterFountain: v.boolean(),
    }),
    location: v.object({
      type: v.literal("Point"),
      coordinates: v.array(v.number()),
    }),
    surfaceType: v.string(),
    cost: v.string(),
    hours: v.object({
      monday: v.string(),
      tuesday: v.string(),
      wednesday: v.string(),
      thursday: v.string(),
      friday: v.string(),
      saturday: v.string(),
      sunday: v.string(),
    }),
    contact: v.object({
      website: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
  },
  handler: async (ctx: { db: any; auth: any }, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called submitCourt without authentication present");
    }

    const now = Date.now();

    // First, get or create the user
    let user = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("clerkId"), identity.tokenIdentifier))
      .first();

    if (!user) {
      // If the user doesn't exist, create a new user
      const userId = await ctx.db.insert("users", {
        clerkId: identity.tokenIdentifier,
        email: identity.email!,
        name: identity.name ?? "Anonymous",
        role: "user",
        createdAt: now,
        updatedAt: now,
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Failed to create or get user");
    }

    // Then create the court with the user's ID
    const courtId = await ctx.db.insert("courts", {
      ...args,
      isVerified: false,
      addedByUser: true,
      lastVerified: now,
      rating: 0,
      submittedBy: user._id,
      createdAt: now,
      updatedAt: now,
      source: "user-submitted",
      createdBy: user._id,
    });

    return courtId;
  },
});

// Get all courts pending approval (admin only)
export const getPendingCourts = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Not authenticated");
    }

    // Check if user is admin
    const isAdmin = await checkIsAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Use index for isVerified = false
    return await ctx.db
      .query("courts")
      .withIndex("by_verified", (q) => q.eq("isVerified", false))
      .collect();
  },
});

// Approve a court (admin only)
export const approveCourt = mutation({
  args: {
    courtId: v.id("courts"),
  },
  returns: v.id("courts"),
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Not authenticated");
    }

    // Check if user is admin
    const isAdmin = await checkIsAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const now = Date.now();
    await ctx.db.patch(args.courtId, {
      isVerified: true,
      lastVerified: now,
      updatedAt: now,
    });

    return args.courtId;
  },
});

// Reject a court (admin only)
export const rejectCourt = mutation({
  args: {
    courtId: v.id("courts"),
  },
  returns: v.id("courts"),
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Not authenticated");
    }

    // Check if user is admin
    const isAdmin = await checkIsAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.courtId);
    return args.courtId;
  },
});

// Get all verified courts (public)
export const getVerifiedCourts = query({
  args: {
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    indoor: v.optional(v.boolean()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    // Always filter by isVerified = true using index
    let courts = await ctx.db
      .query("courts")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect();

    // Additional filters in-memory
    if (args.state) {
      courts = courts.filter((court: any) => court.state === args.state);
    }
    if (args.zipCode) {
      courts = courts.filter((court: any) => court.zipCode === args.zipCode);
    }
    if (args.indoor !== undefined) {
      courts = courts.filter((court: any) => court.indoor === args.indoor);
    }
    return courts;
  },
});

// Search courts by location and filters
export const searchCourts = query({
  args: {
    address: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    indoor: v.optional(v.boolean()),
    maxDistance: v.optional(v.number()),
    coordinates: v.optional(v.array(v.number())), // [longitude, latitude]
  },
  returns: v.array(
    v.object({
      _id: v.id("courts"),
      name: v.string(),
      address: v.string(),
      city: v.optional(v.string()),
      state: v.string(),
      zipCode: v.string(),
      indoor: v.boolean(),
      numberOfCourts: v.number(),
      location: v.object({
        type: v.literal("Point"),
        coordinates: v.array(v.number()),
      }),
      isVerified: v.boolean(),
      addedByUser: v.boolean(),
      lastVerified: v.number(),
      rating: v.number(),
      submittedBy: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Always filter by isVerified = true using index
    let courts = await ctx.db
      .query("courts")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect();

    // Filter by state if provided
    if (args.state) {
      courts = courts.filter(
        (court: { state: string }) => court.state === args.state
      );
    }

    // Filter by zip code if provided
    if (args.zipCode) {
      courts = courts.filter(
        (court: { zipCode: string }) => court.zipCode === args.zipCode
      );
    }

    // Filter by indoor/outdoor if provided
    if (args.indoor !== undefined) {
      courts = courts.filter(
        (court: { indoor: boolean }) => court.indoor === args.indoor
      );
    }

    // Filter by distance if coordinates and maxDistance are provided
    if (args.coordinates && args.maxDistance) {
      const [searchLon, searchLat] = args.coordinates;
      courts = courts.filter((court) => {
        const [courtLon, courtLat] = court.location.coordinates;
        const distance = calculateDistance(
          searchLat,
          searchLon,
          courtLat,
          courtLon
        );
        return distance <= args.maxDistance!;
      });
    }

    // Map the courts to match the return type
    return courts.map((court) => ({
      _id: court._id,
      name: court.name,
      address: court.address,
      city: court.city,
      state: court.state,
      zipCode: court.zipCode,
      indoor: court.indoor,
      numberOfCourts: court.numberOfCourts,
      location: court.location,
      isVerified: court.isVerified,
      addedByUser: court.addedByUser,
      lastVerified: court.lastVerified,
      rating: court.rating || 0,
      submittedBy: court.submittedBy || "",
      createdAt: court.createdAt,
      updatedAt: court.updatedAt,
    }));
  },
});

// Import courts from external sources
export const importExternalCourts = mutation({
  args: {
    courts: v.array(
      v.object({
        name: v.string(),
        address: v.string(),
        state: v.string(),
        zipCode: v.string(),
        indoor: v.boolean(),
        numberOfCourts: v.number(),
        amenities: v.object({
          indoorCourts: v.optional(v.boolean()),
          outdoorCourts: v.optional(v.boolean()),
          lightsAvailable: v.optional(v.boolean()),
          restroomsAvailable: v.optional(v.boolean()),
          waterFountain: v.optional(v.boolean()),
        }),
        location: v.object({
          type: v.literal("Point"),
          coordinates: v.array(v.number()),
        }),
        isVerified: v.boolean(),
        addedByUser: v.boolean(),
        lastVerified: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
        city: v.optional(v.string()),
        surfaceType: v.optional(v.string()),
        cost: v.optional(v.string()),
        hours: v.optional(
          v.object({
            monday: v.optional(v.string()),
            tuesday: v.optional(v.string()),
            wednesday: v.optional(v.string()),
            thursday: v.optional(v.string()),
            friday: v.optional(v.string()),
            saturday: v.optional(v.string()),
            sunday: v.optional(v.string()),
          })
        ),
        contact: v.optional(
          v.object({
            website: v.optional(v.string()),
            phone: v.optional(v.string()),
            email: v.optional(v.string()),
          })
        ),
        rating: v.optional(v.number()),
        submittedBy: v.optional(v.string()),
        source: v.optional(v.string()),
      })
    ),
  },
  returns: v.array(v.id("courts")),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // First, create a system user if it doesn't exist
    let systemUser = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("clerkId"), "system"))
      .first();

    if (!systemUser) {
      const systemUserId = await ctx.db.insert("users", {
        email: "system@courtfinder.com",
        name: "System",
        clerkId: "system",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      systemUser = await ctx.db.get(systemUserId);
    }
    if (!systemUser) throw new Error("Failed to create system user");

    const courtIds = [];
    for (const court of args.courts) {
      // Validate coordinates
      if (
        !Array.isArray(court.location.coordinates) ||
        court.location.coordinates.length !== 2
      ) {
        throw new Error(`Invalid coordinates for court ${court.name}`);
      }

      const courtWithSource = {
        ...court,
        source: court.source ?? "seed-data",
      };

      // Check if court already exists
      const existingCourt = await ctx.db
        .query("courts")
        .withIndex("by_location", (q) => q.eq("location", court.location))
        .first();

      if (existingCourt) {
        // Update existing court
        await ctx.db.patch(existingCourt._id, courtWithSource);
        courtIds.push(existingCourt._id);
      } else {
        // Insert new court
        const courtId = await ctx.db.insert("courts", {
          ...courtWithSource,
          createdBy: systemUser._id,
          submittedBy: systemUser._id,
        });
        courtIds.push(courtId);
      }
    }

    return courtIds;
  },
});

export const patchCourtsAddSource = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const courts = await ctx.db.query("courts").collect();
    for (const court of courts) {
      if (!court.source) {
        await ctx.db.patch(court._id, { source: "user-submitted" });
      }
    }
    return null;
  },
});

// Sample courts data for seeding
const sampleCourts = [
  {
    name: "Westside Recreation Center",
    address: "123 Main St",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90025",
    indoor: true,
    numberOfCourts: 2,
    amenities: {
      indoorCourts: true,
      outdoorCourts: false,
      lightsAvailable: true,
      restroomsAvailable: true,
      waterFountain: true,
    },
    location: {
      type: "Point" as const,
      coordinates: [-118.4452, 34.0522],
    },
    surfaceType: "Wood",
    cost: "Free",
    hours: {
      monday: "9:00 AM - 9:00 PM",
      tuesday: "9:00 AM - 9:00 PM",
      wednesday: "9:00 AM - 9:00 PM",
      thursday: "9:00 AM - 9:00 PM",
      friday: "9:00 AM - 9:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "9:00 AM - 5:00 PM",
    },
    contact: {
      website: "https://example.com",
      phone: "(555) 123-4567",
      email: "info@example.com",
    },
  },
];

export const seedCourts = mutation({
  handler: async (ctx: { db: any; auth: any }) => {
    const now = Date.now();

    // First, create a system user if it doesn't exist
    let systemUser = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("clerkId"), "system"))
      .first();

    if (!systemUser) {
      const systemUserId = await ctx.db.insert("users", {
        email: "system@courtfinder.com",
        name: "System",
        clerkId: "system",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      systemUser = await ctx.db.get(systemUserId);
    }
    if (!systemUser) throw new Error("Failed to create system user");

    // Then seed the courts with the system user's ID
    const courtIds: Id<"courts">[] = [];
    for (const court of sampleCourts) {
      const courtWithSource = {
        ...court,
        source: "seed-data",
        isVerified: true,
        addedByUser: false,
        lastVerified: now,
        rating: 0,
        submittedBy: systemUser._id,
        createdAt: now,
        updatedAt: now,
      };

      const existingCourt = await ctx.db
        .query("courts")
        .filter((q: any) => q.eq(q.field("address"), court.address))
        .first();

      if (existingCourt) {
        courtIds.push(existingCourt._id);
      } else {
        const courtId = await ctx.db.insert("courts", {
          ...courtWithSource,
          createdBy: systemUser._id,
          submittedBy: systemUser._id,
        });
        courtIds.push(courtId);
      }
    }

    return courtIds;
  },
});

export const fixMissingCreatedBy = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // First, create a system user if it doesn't exist
    let systemUser = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("clerkId"), "system"))
      .first();

    if (!systemUser) {
      const systemUserId = await ctx.db.insert("users", {
        email: "system@courtfinder.com",
        name: "System",
        clerkId: "system",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      systemUser = await ctx.db.get(systemUserId);
    }
    if (!systemUser) throw new Error("Failed to create system user");

    // Get all courts missing createdBy
    const courts = await ctx.db.query("courts").collect();
    let fixedCount = 0;

    for (const court of courts) {
      if (!court.createdBy) {
        await ctx.db.patch(court._id, {
          createdBy: systemUser._id,
          updatedAt: now,
        });
        fixedCount++;
      }
    }

    return { fixedCount };
  },
});
