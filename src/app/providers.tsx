"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";

// Debug environment variables
console.log(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY present:",
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);
console.log(
  "NEXT_PUBLIC_CONVEX_URL present:",
  !!process.env.NEXT_PUBLIC_CONVEX_URL
);
console.log(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY value:",
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);
console.log(
  "NEXT_PUBLIC_CONVEX_URL value:",
  process.env.NEXT_PUBLIC_CONVEX_URL
);

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
}

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable"
  );
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="p-4 text-red-900 rounded bg-red-50">
      <p>Something went wrong:</p>
      <pre className="mt-2 text-sm">{error.message}</pre>
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        appearance={{
          baseTheme: undefined,
        }}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
