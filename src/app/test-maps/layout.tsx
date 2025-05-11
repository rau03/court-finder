"use client";

import { GoogleMapsProvider } from "../context/GoogleMapsContext";

export default function TestMapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}
