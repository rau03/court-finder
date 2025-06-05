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
    <header className="bg-white border-b-[5px] border-[#222] relative z-50">
      <div className="flex items-center justify-between max-w-6xl p-4 mx-auto">
        {/* Title - Centered on Mobile */}
        <Link
          href="/"
          className="text-3xl font-black text-[#222] hover:text-[var(--primary)] transition-colors relative md:ml-0 mx-auto z-40"
        >
          Pickleball Court Hub
        </Link>

        {/* Hamburger Menu Button - Mobile Only */}
        <button
          onClick={toggleMenu}
          className="z-50 p-3 bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition md:hidden"
          aria-label="Toggle menu"
        >
          <div className="w-8 h-1 mb-2 bg-white"></div>
          <div className="w-8 h-1 mb-2 bg-white"></div>
          <div className="w-8 h-1 bg-white"></div>
        </button>

        {/* Desktop Navigation */}
        <div className="items-center hidden gap-4 md:flex">
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
          className={`fixed top-[73px] left-0 right-0 bg-white border-b-[5px] border-[#222] p-4 transform transition-transform duration-300 ease-in-out z-40 ${
            isMenuOpen ? "translate-y-0" : "-translate-y-full"
          } md:hidden`}
        >
          <div className="flex flex-col items-center gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="w-full px-4 py-2 font-black text-white bg-[var(--primary)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[-0.5deg] text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <Link
              href="/submit-court"
              className="w-full px-4 py-2 font-black text-black bg-[var(--accent)] border-3 border-[#222] shadow-[4px_4px_0px_0px_rgba(30,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(30,30,30,1)] hover:-translate-y-1 transform transition rotate-[0.5deg] text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Submit Court
            </Link>

            {isSignedIn ? (
              <div className="flex justify-center w-full">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex flex-col w-full gap-2">
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
