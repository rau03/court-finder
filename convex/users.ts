// All Clerk-specific user queries and mutations have been removed.

import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to check if a user is an admin
export const isAdmin = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .first();

      return user?.isAdmin === true;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },
});
