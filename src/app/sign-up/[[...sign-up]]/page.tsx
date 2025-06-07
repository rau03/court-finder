"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <SignUp afterSignUpUrl="/submit-court" redirectUrl="/submit-court" />
    </div>
  );
}
