"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomSignUpPage() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      // Start the sign up process
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Check if sign up was successful
      if (result.status === "complete") {
        // If complete, redirect to home page
        router.push("/");
      } else if (result.status === "missing_requirements") {
        // Handle email verification if needed
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setPendingVerification(true);
      } else {
        setError("Sign up process incomplete. Please try again.");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign up"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-xl rounded-xl">
        <h1 className="mb-6 text-3xl font-bold text-center text-black">
          Create Account
        </h1>

        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="firstName"
                className="block mb-2 font-medium text-black"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 text-black border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block mb-2 font-medium text-black"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 text-black border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-black"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 text-black border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-black"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-black border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              minLength={8}
              required
            />
            <p className="mt-1 text-sm text-gray-600">
              Password must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full px-4 py-3 font-medium text-white transition duration-150 ease-in-out bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-black">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
