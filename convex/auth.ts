import { internalQuery } from "./_generated/server";

// A more generic type for the context
export type GenericCtx = {
  db: any;
  auth: any;
};

// Remove Clerk-specific admin/user helpers
