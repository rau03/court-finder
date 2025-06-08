// All Clerk-specific user queries and mutations have been removed.

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to check if a user is an admin
export const isAdmin = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();

      return user?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },
});

export const getUser = query({
  args: {
    email: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    return user;
  },
});

export const isUserAdmin = query({
  args: {
    email: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    return user?.role === "admin";
  },
});

// Mutation to set a user as admin
export const setUserAsAdmin = mutation({
  args: {
    email: v.string(),
    clerkId: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, clerkId, name } = args;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        role: "admin",
        updatedAt: Date.now(),
        clerkId: clerkId,
        name: name || existingUser.name,
      });
      return existingUser._id;
    } else {
      // Create new user
      const now = Date.now();
      return await ctx.db.insert("users", {
        email,
        name: name || "Admin User",
        clerkId: clerkId,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
