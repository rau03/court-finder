import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleMapsProvider } from "./context/GoogleMapsContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickleball Court Finder USA",
  description: "Find pickleball courts across the United States",
  keywords: "pickleball, courts, finder, USA, indoor, outdoor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorText: "#000000",
              colorTextSecondary: "#000000",
              colorTextOnPrimaryBackground: "#ffffff",
              colorInputText: "#000000",
              colorInputBackground: "#ffffff",
            },
            elements: {
              // Your existing Clerk appearance settings
            },
          }}
        >
          <GoogleMapsProvider>{children}</GoogleMapsProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
