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
    if (!identity) {
      throw new Error("Not authenticated");
    }

    try {
      // Create court with unverified status
      const now = Date.now();
      const courtId = await ctx.db.insert("courts", {
        ...args,
        isVerified: false, // All submitted courts need verification
        addedByUser: true,
        lastVerified: now,
        rating: 0,
        submittedBy: identity.subject,
        createdAt: now,
        updatedAt: now,
      });

      return courtId;
    } catch (error) {
      console.error("Error submitting court:", error);
      throw new Error("Failed to submit court. Please try again.");
    }
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
    address: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    indoor: v.optional(v.boolean()),
    maxDistance: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("courts"),
      name: v.string(),
      address: v.string(),
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

    // Map the courts to match the return type
    return courts.map((court) => ({
      _id: court._id,
      name: court.name,
      address: court.address,
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
