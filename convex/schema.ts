import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Courts table
  courts: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.optional(v.string()),
    state: v.string(),
    zipCode: v.string(),
    location: v.object({
      type: v.literal("Point"),
      coordinates: v.array(v.number()),
    }),
    amenities: v.object({
      indoorCourts: v.optional(v.boolean()),
      outdoorCourts: v.optional(v.boolean()),
      lightsAvailable: v.optional(v.boolean()),
      restroomsAvailable: v.optional(v.boolean()),
      waterFountain: v.optional(v.boolean()),
    }),
    numberOfCourts: v.number(),
    surfaceType: v.optional(v.string()),
    cost: v.optional(v.string()),
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
    lastVerified: v.number(), // timestamp
    rating: v.optional(v.number()),
    indoor: v.boolean(),
    contact: v.optional(
      v.object({
        website: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
      })
    ),
    submittedBy: v.optional(v.string()), // ID of user who submitted
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  })
    .index("by_location", ["location"])
    .index("by_state", ["state"])
    .index("by_zipCode", ["zipCode"])
    .index("by_indoor", ["indoor"])
    .index("by_verified", ["isVerified"]),

  // Favorites table
  favorites: defineTable({
    userId: v.string(),
    courtId: v.id("courts"),
    createdAt: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_court", ["courtId"])
    .index("by_user_and_court", ["userId", "courtId"]),

  // Users table
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.string(), // "admin" or "user"
    clerkId: v.string(), // ID from Clerk auth
  }).index("by_clerkId", ["clerkId"]),
});
