"use client";

import React, { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Create a component to handle environment validation and initialization
function EnvValidatedProviders({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
      setError(
        "Convex URL is not configured. Please check your environment variables."
      );
      return;
    }

    try {
      const newClient = new ConvexReactClient(convexUrl);
      setClient(newClient);
    } catch (e) {
      console.error("Error initializing Convex client:", e);
      setError(
        "Failed to initialize Convex client. Please check your configuration."
      );
    }
  }, []);

  // Check Clerk configuration
  useEffect(() => {
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!clerkPublishableKey) {
      console.error(
        "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable"
      );
      setError(
        (prev) =>
          prev ||
          "Clerk publishable key is not configured. Please check your environment variables."
      );
    }
  }, []);

  // Display error if environment variables are missing
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-red-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="mb-4 text-xl font-bold text-red-600">
            Configuration Error
          </div>
          <p className="mb-4 text-gray-700">{error}</p>
          <p className="text-sm text-gray-500">
            Please check your environment variables and restart the application.
            {process.env.NODE_ENV !== "production" && (
              <>
                <br />
                <br />
                <strong>Development Setup Instructions:</strong>
                <ol className="pl-5 mt-2 list-decimal">
                  <li>Create a .env.local file in the project root</li>
                  <li>Add NEXT_PUBLIC_CONVEX_URL from your Convex dashboard</li>
                  <li>
                    Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY from your Clerk
                    dashboard
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Only render providers when client is initialized
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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
      <ConvexProvider client={client}>{children}</ConvexProvider>
    </ClerkProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <EnvValidatedProviders>{children}</EnvValidatedProviders>;
}
