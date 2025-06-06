"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useEffect } from "react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
}

// Debug: Check if Clerk key is present
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable"
  );
}

console.log(
  "Clerk key present (first 5 chars):",
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 5)
);

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function ClerkDebug() {
  useEffect(() => {
    console.log("ClerkDebug mounted");
    return () => console.log("ClerkDebug unmounted");
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
          footerActionLink: "text-blue-500 hover:text-blue-600",
        },
      }}
      navigate={(to) => {
        console.log("Clerk navigation to:", to);
        window.location.href = to;
      }}
    >
      <ClerkDebug />
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
