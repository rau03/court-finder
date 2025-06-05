"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function Header() {
  const { userId, isSignedIn } = useAuth();
  const isAdmin = useQuery(api.users.isAdmin, { userId: userId ?? "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b-[5px] border-[#222] relative z-10">
      <div className="flex items-center justify-between max-w-6xl p-4 mx-auto">
        {/* Hamburger Menu Button - Mobile Only */}
        <button
          onClick={toggleMenu}
          className="p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-[#222] mb-1.5"></div>
          <div className="w-6 h-0.5 bg-[#222] mb-1.5"></div>
          <div className="w-6 h-0.5 bg-[#222]"></div>
        </button>

        {/* Title - Centered on Mobile */}
        <Link
          href="/"
          className="text-3xl font-black text-[#222] hover:text-[var(--primary)] transition-colors relative md:ml-0 mx-auto"
        >
          Pickleball Court Hub
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[-0.5deg]"
            >
              Admin
            </Link>
          )}
          <Link
            href="/submit-court"
            className="px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[0.5deg]"
          >
            Submit Court
          </Link>

          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-[73px] left-0 right-0 bg-white border-b-[5px] border-[#222] p-4 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-y-0" : "-translate-y-full"
          } md:hidden`}
        >
          <div className="flex flex-col gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[-0.5deg]"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <Link
              href="/submit-court"
              className="px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[0.5deg]"
              onClick={() => setIsMenuOpen(false)}
            >
              Submit Court
            </Link>

            {isSignedIn ? (
              <div className="flex justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <SignInButton mode="modal">
                  <button className="w-full px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
