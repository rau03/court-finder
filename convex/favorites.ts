import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
        indoor: v.boolean(),
        numberOfCourts: v.number(),
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
        return {
          _id: favorite._id,
          courtId: {
            _id: court._id,
            name: court.name,
            address: court.address,
            state: court.state,
            indoor: court.indoor,
            numberOfCourts: court.numberOfCourts,
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
