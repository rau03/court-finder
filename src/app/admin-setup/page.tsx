"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export default function AdminSetup() {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const { userId } = useAuth();

  const isAdmin = useQuery(api.users.isAdmin);
  const setUserAsAdminMutation = useMutation(api.users.setUserAsAdmin);

  const handleSetAdmin = async () => {
    try {
      // First create/update the user
      await setUserAsAdminMutation();
      setIsError(false);
      setMessage("Success! You are now an admin.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
        <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Admin Status
          </h1>
          <p className="text-green-600">You are already an admin!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Admin Setup</h1>
        {message && (
          <div
            className={`p-4 mb-4 rounded ${
              isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
        <button
          onClick={handleSetAdmin}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Make Me Admin
        </button>
      </div>
    </div>
  );
}
