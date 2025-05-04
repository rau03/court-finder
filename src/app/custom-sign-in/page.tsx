"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Map from "../components/Map";

export default function CustomSignInPage() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        router.push("/");
      } else {
        setError("Sign in failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-xl rounded-xl">
        <h1 className="mb-6 text-3xl font-bold text-center text-black">
          Sign In
        </h1>

        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full px-4 py-3 font-medium text-white transition duration-150 ease-in-out bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-black">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>

        {/* Map */}
        {isGoogleMapsLoaded ? (
          <div className="overflow-hidden border-4 border-white shadow-lg rounded-xl">
            <Map
              courts={courts}
              center={mapCenter || undefined}
              zoom={mapZoom}
            />
          </div>
        ) : loadError ? (
          <div className="p-4 text-red-700 bg-red-100 rounded">
            Error loading maps: {loadError.message}
          </div>
        ) : (
          <div className="p-4 text-gray-700 bg-gray-100 rounded">
            Loading maps...
          </div>
        )}
      </div>
    </div>
  );
}
