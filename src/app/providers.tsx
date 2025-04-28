"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize the Convex client with the URL from environment variables
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorText: "#000000",
          colorTextSecondary: "#000000",
          colorTextOnPrimaryBackground: "#ffffff",
          colorInputText: "#000000",
          colorInputBackground: "#ffffff",
        },
        elements: {
          // Your existing Clerk appearance settings
        },
      }}
    >
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ClerkProvider>
  );
}
