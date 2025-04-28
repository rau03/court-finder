import { internalQuery } from "./_generated/server";

// A more generic type for the context
export type GenericCtx = {
  db: any;
  auth: any;
};

// Check if a user is an admin
export const isUserAdmin = async (
  ctx: GenericCtx,
  userId: string
): Promise<boolean> => {
  if (!userId) return false;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", userId))
    .first();

  return user?.role === "admin";
};

// Get user by Clerk ID
export const getUserByClerkId = async (ctx: GenericCtx, clerkId: string) => {
  if (!clerkId) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
    .first();
};
