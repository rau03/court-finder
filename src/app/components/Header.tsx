"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <header className="bg-white border-b-[5px] border-[#222] relative z-10">
      <div className="flex items-center justify-between max-w-6xl p-4 mx-auto">
        <Link
          href="/"
          className="text-3xl font-black text-[#222] hover:text-[var(--primary)] transition-colors relative"
        >
          Pickleball Court Finder
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/submit-court"
            className="px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[0.5deg]"
          >
            Submit Court
          </Link>

          {!isLoaded ? (
            <div className="w-8 h-8 bg-gray-200 border-2 border-[#222] rounded-full animate-pulse"></div>
          ) : isSignedIn ? (
            <>
              <span className="font-black text-[#222]">
                Hello,{" "}
                {user.firstName ||
                  user.emailAddresses[0].emailAddress.split("@")[0]}
              </span>
              <Link
                href="/favorites"
                className="px-4 py-2 font-black text-white bg-[var(--secondary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[-0.5deg]"
              >
                My Favorites
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 font-black text-black bg-[var(--secondary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[-0.8deg]">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 font-black text-black bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[0.8deg]">
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
