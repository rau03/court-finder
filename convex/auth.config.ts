import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// This is the configuration for Clerk authentication
export const authConfig = {
  providers: [
    {
      domain: "https://court-finder.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

// This function is called when a user signs in
export const onSignIn = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!existingUser) {
      // Create new user
      await ctx.db.insert("users", {
        email: args.email,
        role: "user", // Default role
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
