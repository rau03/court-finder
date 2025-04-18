"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function TestNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        color: "black",
        padding: "15px",
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Link href="/" style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
        Pickleball Court Finder
      </Link>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {user ? (
          <>
            <Link href="/favorites" style={{ color: "#2563eb" }}>
              My Favorites
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                padding: "8px 12px",
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
            <div
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {user.email.charAt(0).toUpperCase()}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/custom-sign-in"
              style={{
                color: "#2563eb",
                padding: "8px 12px",
              }}
            >
              Sign In
            </Link>
            <Link
              href="/custom-sign-up"
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
