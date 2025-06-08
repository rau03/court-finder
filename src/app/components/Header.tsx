"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <header className="bg-white border-b-[5px] border-[#222] relative z-50">
        <div className="flex flex-col items-center justify-between max-w-6xl gap-4 p-4 mx-auto md:flex-row">
          <div className="text-3xl font-black text-[#222]">
            Pickleball Court Hub
          </div>
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <div className="w-full md:w-[200px] px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] text-center">
              Submit Court
            </div>
            <div className="flex flex-col w-full gap-2 md:flex-row md:w-auto md:min-w-[408px]">
              <div className="w-full md:w-[200px] px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] text-center">
                Sign In
              </div>
              <div className="w-full md:w-[200px] px-4 py-2 font-black text-white bg-[var(--secondary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] text-center">
                Sign Up
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b-[5px] border-[#222] relative z-50">
      <div className="flex flex-col items-center justify-between max-w-6xl gap-4 p-4 mx-auto md:flex-row">
        {/* Title */}
        <Link
          href="/"
          className="text-3xl font-black text-[#222] hover:text-[var(--primary)] transition-colors"
        >
          Pickleball Court Hub
        </Link>

        {/* Navigation Buttons */}
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          {authLoaded && userLoaded && isAdmin && (
            <Link
              href="/admin"
              className="w-full md:w-[200px] px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[-0.5deg] text-center"
            >
              Admin
            </Link>
          )}
          <Link
            href="/submit-court"
            className="w-full md:w-[200px] px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[0.5deg] text-center"
          >
            Submit Court
          </Link>
          {/* Auth buttons - Clerk only, no switching */}
          <div
            className="flex flex-col w-full gap-2 md:flex-row md:w-auto md:min-w-[408px]"
            suppressHydrationWarning
          >
            {authLoaded && isSignedIn ? (
              <div className="flex justify-center w-full md:w-[200px] mx-auto">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex flex-col w-full gap-2 md:flex-row md:w-auto">
                <div className="w-full md:w-[200px]">
                  <SignInButton mode="modal">
                    <button className="w-full px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
                <div className="w-full md:w-[200px]">
                  <SignUpButton mode="modal">
                    <button className="w-full px-4 py-2 font-black text-white bg-[var(--secondary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
