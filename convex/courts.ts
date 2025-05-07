import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isUserAdmin } from "./auth";

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
      indoorCourts: v.optional(v.boolean()),
      outdoorCourts: v.optional(v.boolean()),
      lightsAvailable: v.optional(v.boolean()),
      restroomsAvailable: v.optional(v.boolean()),
      waterFountain: v.optional(v.boolean()),
    }),
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
    location: v.object({
      type: v.literal("Point"),
      coordinates: v.array(v.number()),
    }),
  },
  returns: v.id("courts"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Create court with unverified status
    const now = Date.now();
    const courtId = await ctx.db.insert("courts", {
      ...args,
      isVerified: false, // All submitted courts need verification
      addedByUser: true,
      lastVerified: now,
      rating: 0,
      submittedBy: identity?.subject,
      createdAt: now,
      updatedAt: now,
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
    const admin = await isUserAdmin(ctx, identity.subject);
    if (!admin) {
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
    const admin = await isUserAdmin(ctx, identity.subject);
    if (!admin) {
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
    const admin = await isUserAdmin(ctx, identity.subject);
    if (!admin) {
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
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    maxDistance: v.optional(v.number()), // in meters
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

    // Geospatial filter in-memory
    if (args.latitude !== undefined && args.longitude !== undefined) {
      const maxDistance = args.maxDistance ?? 50000; // Default 50km
      courts = courts.filter((court: any) => {
        if (!court.location || !court.location.coordinates) return false;
        const [lng, lat] = court.location.coordinates;
        const dx = lng - args.longitude!;
        const dy = lat - args.latitude!;
        const distance = Math.sqrt(dx * dx + dy * dy) * 111320; // rough meters per degree
        return distance <= maxDistance;
      });
    }
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
