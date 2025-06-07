import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internalMutation } from "./_generated/server";

interface UserIdentity {
  tokenIdentifier: string;
  email?: string;
  name?: string;
  subject?: string;
}

const auth = {
  providers: [
    {
      domain: "court-finder-ten.vercel.app",
      applicationID: "convex",
    },
  ],
  getUserMetadata: async (ctx: {
    auth: { getUserIdentity: () => Promise<UserIdentity | null> };
    db: any;
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get the user's Clerk ID from the token
    const userId = identity.subject || identity.tokenIdentifier;
    if (!userId) {
      throw new ConvexError("No user ID found in token");
    }

    // Check if the user already exists in the database
    const user = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("clerkId"), userId))
      .first();

    if (!user) {
      // If the user doesn't exist, create a new user
      await ctx.db.insert("users", {
        clerkId: userId,
        email: identity.email!,
        name: identity.name ?? "Anonymous",
        role: "user",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Return the Clerk user ID as the Convex user ID
    return {
      userId: userId,
      tokenIdentifier: identity.tokenIdentifier,
    };
  },
};

export default auth;

export const getUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Called getUser without authentication present");
    }

    // Get the user's Clerk ID from the token
    const userId = identity.tokenIdentifier;

    // Check if the user already exists in the database
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), userId))
      .first();

    if (user) {
      return user._id;
    }

    // If the user doesn't exist, create a new user
    const newUserId = await ctx.db.insert("users", {
      clerkId: userId,
      email: identity.email!,
      name: identity.name ?? "Anonymous",
      role: "user",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newUserId;
  },
});
