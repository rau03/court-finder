"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Header from "../components/Header";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";

export default function AdminSetup() {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const user = useQuery(api.users.getMe);
  const isAdmin = useQuery(api.users.isAdmin);
  const setUserAsAdminMutation = useMutation(api.users.setUserAsAdmin);

  const handleSetAdmin = async () => {
    try {
      await setUserAsAdminMutation({});
      setIsError(false);
      setMessage("Success! You are now an admin.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div>
      <Header />

      <div className="max-w-xl p-8 mx-auto">
        <h1 className="inline-block pb-2 mb-6 text-3xl font-black text-black border-b-4 border-black">
          Admin Setup
        </h1>

        {message && (
          <div
            className={`p-4 mb-6 rounded ${isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {message}
          </div>
        )}

        <div className="p-6 bg-white rounded-lg border-3 border-black shadow-[4px_4px_0px_0px_rgba(30,30,30,0.8)]">
          <p className="mb-4 font-medium text-black">
            This page allows you to set yourself up as an admin. This will only
            work for:
          </p>

          <ul className="pl-5 mb-6 font-medium text-black list-disc">
            <li>The very first user of the system</li>
            <li>Users who are already admins</li>
          </ul>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-bold text-black">
              Current Status
            </h2>
            {user === undefined ? (
              <p className="text-black">Loading...</p>
            ) : user === null ? (
              <p className="font-bold text-red-600">Not logged in</p>
            ) : (
              <p className="text-black">
                <span className="font-bold">Logged in as:</span>{" "}
                {user.name || user.email || "User"}
                <br />
                <span className="font-bold">Role:</span>{" "}
                {isAdmin ? "Admin ✅" : "Regular user"}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSetAdmin}
              disabled={isAdmin === true}
              className="px-4 py-2 bg-[var(--primary)] text-white font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(30,30,30,1)] hover:shadow-[5px_5px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdmin ? "Already Admin" : "Make Me Admin"}
            </button>

            <Link
              href="/"
              className="px-4 py-2 bg-[var(--secondary)] text-white font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(30,30,30,1)] hover:shadow-[5px_5px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
