"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MapWrapper from "../components/MapWrapper";

interface MapMarker {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
}

export default function CustomSignInPage() {
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setError("");
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        router.push("/");
      } else {
        setError("Sign in process incomplete. Please try again.");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleMapLoad = () => {
    setIsMapLoaded(true);
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
              onChange={handleEmailChange}
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
              onChange={handlePasswordChange}
              className="w-full p-3 text-black border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!isLoaded}
            className="w-full px-4 py-3 font-medium text-white transition duration-150 ease-in-out bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-black">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <div className="h-64">
            <MapWrapper
              markers={[]}
              center={{ lat: 39.8283, lng: -98.5795 }}
              zoom={4}
              onLoad={handleMapLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
