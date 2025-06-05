import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user's favorites with court details
export const getUserFavoritesWithDetails = query({
  args: {
    userId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("favorites"),
      courtId: v.object({
        _id: v.id("courts"),
        name: v.string(),
        address: v.string(),
        state: v.string(),
        zipCode: v.string(),
        numberOfCourts: v.number(),
        indoor: v.boolean(),
        location: v.object({
          type: v.literal("Point"),
          coordinates: v.array(v.number()),
        }),
        city: v.optional(v.string()),
        surfaceType: v.optional(v.string()),
        cost: v.optional(v.string()),
        amenities: v.object({
          indoorCourts: v.optional(v.boolean()),
          outdoorCourts: v.optional(v.boolean()),
          lightsAvailable: v.optional(v.boolean()),
          restroomsAvailable: v.optional(v.boolean()),
          waterFountain: v.optional(v.boolean()),
        }),
        contact: v.optional(
          v.object({
            website: v.optional(v.string()),
            phone: v.optional(v.string()),
            email: v.optional(v.string()),
          })
        ),
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
        isVerified: v.boolean(),
        addedByUser: v.boolean(),
        lastVerified: v.number(),
        rating: v.optional(v.number()),
        submittedBy: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        source: v.optional(v.string()),
      }),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get court details for each favorite
    const favoritesWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        const court = await ctx.db.get(favorite.courtId);
        if (!court) {
          throw new Error(`Court ${favorite.courtId} not found`);
        }

        // Validate coordinates
        if (
          !Array.isArray(court.location.coordinates) ||
          court.location.coordinates.length !== 2
        ) {
          throw new Error(`Invalid coordinates for court ${court._id}`);
        }

        return {
          _id: favorite._id,
          courtId: {
            ...court,
            location: {
              ...court.location,
              coordinates: court.location.coordinates,
            },
          },
          createdAt: favorite.createdAt,
        };
      })
    );

    return favoritesWithDetails;
  },
});

// Get user's favorites
export const getUserFavorites = query({
  args: {
    userId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("favorites"),
      courtId: v.id("courts"),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Add a favorite
export const addFavorite = mutation({
  args: {
    userId: v.string(),
    courtId: v.id("courts"),
  },
  returns: v.id("favorites"),
  handler: async (ctx, args) => {
    // Check if court exists
    const court = await ctx.db.get(args.courtId);
    if (!court) {
      throw new Error("Court not found");
    }

    // Check if favorite already exists
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_court", (q) =>
        q.eq("userId", args.userId).eq("courtId", args.courtId)
      )
      .first();

    if (existingFavorite) {
      throw new Error("Court already in favorites");
    }

    // Create favorite
    return await ctx.db.insert("favorites", {
      userId: args.userId,
      courtId: args.courtId,
      createdAt: Date.now(),
    });
  },
});

// Remove a favorite
export const removeFavorite = mutation({
  args: {
    userId: v.string(),
    courtId: v.id("courts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_court", (q) =>
        q.eq("userId", args.userId).eq("courtId", args.courtId)
      )
      .first();

    if (favorite) {
      await ctx.db.delete(favorite._id);
    }

    return null;
  },
});

// Check if a court is favorited by a user
export const isFavorited = query({
  args: {
    userId: v.string(),
    courtId: v.id("courts"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_court", (q) =>
        q.eq("userId", args.userId).eq("courtId", args.courtId)
      )
      .first();

    return favorite !== null;
  },
});
