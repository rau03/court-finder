import { internalQuery } from "./_generated/server";
import { QueryInitializer } from "convex/server";
import { Doc } from "./_generated/dataModel";
import { isAdmin } from "./users";
import { v } from "convex/values";

// A more generic type for the context
export type GenericCtx = {
  db: unknown;
  auth: unknown;
};

// Admin check function
export const isUserAdmin = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.userId))
        .first();

      return user?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },
});

// Remove Clerk-specific admin/user helpers
