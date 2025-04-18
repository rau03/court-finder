"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestSignInPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if Clerk is available
    if (typeof window !== "undefined") {
      if (window.Clerk) {
        console.log("Clerk global is available");
        // Redirect to the real sign-in page
        router.push("/sign-in");
      } else {
        console.log("Clerk global is NOT available");
      }
    }
  }, [router]);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
        Test Sign In Page
      </h1>
      <p>This page checks if Clerk is available in your application.</p>
      <p>Check your browser console for messages.</p>
      <p>Environment check:</p>
      <pre>
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:{" "}
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(
              0,
              10
            )}...`
          : "Not set"}
      </pre>
      <div style={{ marginTop: "20px" }}>
        <a href="/" style={{ color: "blue" }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}
