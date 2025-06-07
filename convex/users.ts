// All Clerk-specific user queries and mutations have been removed.

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to check if a user is an admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return false;
      }

      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), identity.email))
        .first();

      return user?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },
});

export const getUser = query({
  args: {},
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
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    return user;
  },
});

export const isUserAdmin = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    return user?.role === "admin";
  },
});

// Mutation to set a user as admin
export const setUserAsAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const email = identity.email;

    if (!email) {
      throw new Error("Email is required");
    }

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
      });
      return existingUser._id;
    } else {
      // Create new user
      const now = Date.now();
      return await ctx.db.insert("users", {
        email,
        name: "Anonymous",
        clerkId: "system",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
