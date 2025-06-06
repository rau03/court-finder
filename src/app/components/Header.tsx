"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

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
          {isAdmin && (
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

          {isSignedIn ? (
            <div className="flex justify-center w-full md:w-[200px]">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <div className="flex flex-col w-full gap-2 md:flex-row md:w-auto">
              <SignInButton mode="modal">
                <button className="w-full md:w-[200px] px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full md:w-[200px] px-4 py-2 font-black text-white bg-[var(--secondary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
