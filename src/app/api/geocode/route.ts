import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoder";

// Simple in-memory rate limiter
const rateLimiter = {
  requests: new Map<string, { count: number; resetTime: number }>(),

  // Configure rate limits
  maxRequests: 10, // Max 10 requests
  windowMs: 60 * 1000, // per minute (60 seconds)

  // Check if request exceeds rate limit
  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const requestData = this.requests.get(ip);

    // If no previous requests or window has expired, create new entry
    if (!requestData || now > requestData.resetTime) {
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    // If under limit, increment count
    if (requestData.count < this.maxRequests) {
      requestData.count++;
      return false;
    }

    // Otherwise rate limited
    return true;
  },

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(ip);
      }
    }
  },
};

// Clean up old rate limit entries every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

export async function GET(request: NextRequest) {
  // Get client IP for rate limiting
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

  // Check if rate limited
  if (rateLimiter.isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  // Validate input
  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  // Basic input validation for address
  if (
    typeof address !== "string" ||
    address.length < 3 ||
    address.length > 250
  ) {
    return NextResponse.json(
      { error: "Invalid address parameter" },
      { status: 400 }
    );
  }

  // Check for potentially harmful characters
  if (/[<>]/.test(address)) {
    return NextResponse.json(
      { error: "Invalid characters in address" },
      { status: 400 }
    );
  }

  try {
    const location = await geocodeAddress(address);

    if (!location) {
      return NextResponse.json(
        { error: "Could not geocode the provided address" },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
