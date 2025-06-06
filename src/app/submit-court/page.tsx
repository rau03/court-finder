"use client";

import { useAuth, SignIn } from "@clerk/nextjs";
import SubmitCourtForm from "../components/SubmitCourtForm";

export default function SubmitCourt() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while auth is being checked
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  // Show sign-in component if not signed in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
            Sign in to Submit a Court
          </h2>
          <SignIn afterSignInUrl="/submit-court" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6 mx-auto mt-10">
      <SubmitCourtForm />
    </div>
  );
}
