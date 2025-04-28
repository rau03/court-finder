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

    return await ctx.db
      .query("courts")
      .filter((q) => q.eq(q.field("isVerified"), false))
      .collect();
  },
});

// Approve a court (admin only)
export const approveCourt = mutation({
  args: {
    courtId: v.id("courts"),
  },
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
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("courts")
      .filter((q) => q.eq(q.field("isVerified"), true));

    // Apply filters if provided
    if (args.state) {
      query = query.filter((q) => q.eq(q.field("state"), args.state));
    }

    if (args.zipCode) {
      query = query.filter((q) => q.eq(q.field("zipCode"), args.zipCode));
    }

    if (args.indoor !== undefined) {
      query = query.filter((q) => q.eq(q.field("indoor"), args.indoor));
    }

    return await query.collect();
  },
});
