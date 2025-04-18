"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-black text-center mb-6">
          Sign In
        </h1>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-2 text-black font-medium"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-black font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-150 ease-in-out"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-black">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-800 font-medium"
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
          <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white">
            <Map
              courts={courts}
              center={mapCenter || undefined}
              zoom={mapZoom}
            />
          </div>
        ) : loadError ? (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            Error loading maps: {loadError.message}
          </div>
        ) : (
          <div className="p-4 bg-gray-100 text-gray-700 rounded">
            Loading maps...
          </div>
        )}
      </div>
    </div>
  );
}
