"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export default function TestSignInPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };

    handleSignOut();
  }, [signOut]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Signing out...</h1>
        <p className="text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
