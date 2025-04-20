"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <header className="bg-white border-b-[4px] border-black">
      <div className="flex items-center justify-between max-w-6xl p-4 mx-auto">
        <Link
          href="/"
          className="text-3xl font-black text-black hover:text-[var(--primary)] transition-colors"
        >
          Pickleball Court Finder
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/submit-court"
            className="px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transform transition"
          >
            Submit Court
          </Link>

          {!isLoaded ? (
            <div className="w-8 h-8 bg-gray-200 border-2 border-black rounded-full animate-pulse"></div>
          ) : isSignedIn ? (
            <>
              <span className="font-black text-black">
                Hello,{" "}
                {user.firstName ||
                  user.emailAddresses[0].emailAddress.split("@")[0]}
              </span>
              <Link
                href="/favorites"
                className="px-4 py-2 font-black text-white bg-[var(--secondary)] border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transform transition"
              >
                My Favorites
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="font-black text-black hover:text-[var(--primary)] transform hover:scale-110 transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 font-black text-black bg-[var(--primary)] border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transform transition">
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
