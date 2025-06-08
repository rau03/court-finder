"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";

// Add debug logging
console.log("=== CONVEX DEBUG ===");
console.log("CONVEX_URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
console.log("CONVEX_DEPLOYMENT:", process.env.CONVEX_DEPLOYMENT);

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
}

// Force HTTP polling instead of websockets to bypass connection issues
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
  webSocketConstructor: undefined, // This forces HTTP polling
});

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
