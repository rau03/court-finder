import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isUserAdmin } from "./auth";

// Get current authenticated user
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

// Create or update the user when they log in
export const createOrUpdateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      // Update existing user if needed
      return existingUser._id;
    }

    // Create new user with default role
    const userId = await ctx.db.insert("users", {
      name: args.name || identity.name || "",
      email: args.email || identity.email || "",
      clerkId: identity.subject,
      role: "user", // Default role
    });

    return userId;
  },
});

// Set a user as admin (only for admins or first user)
export const setUserAsAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    // If no user exists, create one
    if (!currentUser) {
      return await ctx.db.insert("users", {
        name: identity.name || "",
        email: identity.email || "",
        clerkId: identity.subject,
        role: "admin",
      });
    }

    // Check if there are any users in the system
    const allUsers = await ctx.db.query("users").collect();

    // Allow if this is the first user or if current user is already an admin
    if (allUsers.length === 0 || currentUser.role === "admin") {
      await ctx.db.patch(currentUser._id, { role: "admin" });
      return currentUser._id;
    }

    throw new Error("Unauthorized: Only admins can create admins");
  },
});

// Check if the current user is an admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    return await isUserAdmin(ctx, identity.subject);
  },
});
