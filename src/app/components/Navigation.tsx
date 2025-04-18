"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="p-4 flex justify-between items-center bg-white shadow-md">
      <Link href="/" className="font-bold text-xl">
        Pickleball Court Finder
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/custom-sign-in" className="text-blue-600 hover:underline">
          Sign In
        </Link>
        <Link
          href="/custom-sign-up"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
