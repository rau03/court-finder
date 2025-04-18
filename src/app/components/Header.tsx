"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-blue-800">
          Pickleball Court Finder
        </Link>

        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : isSignedIn ? (
            <>
              <span className="font-medium">
                Hello,{" "}
                {user.firstName ||
                  user.emailAddresses[0].emailAddress.split("@")[0]}
              </span>
              <Link
                href="/favorites"
                className="text-blue-600 hover:text-blue-800"
              >
                My Favorites
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-blue-600 hover:text-blue-800">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
