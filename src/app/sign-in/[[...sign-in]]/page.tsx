"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <SignIn afterSignInUrl="/submit-court" redirectUrl="/submit-court" />
    </div>
  );
}
