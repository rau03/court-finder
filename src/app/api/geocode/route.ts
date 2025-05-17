import { NextRequest, NextResponse } from "next/server";

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

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Attempting to geocode address:", address);

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key is missing");
      throw new Error("Google Maps API key is not configured");
    }

    // Log the first few characters of the API key to verify it's being loaded
    console.log(
      "API Key present (first 5 chars):",
      apiKey.substring(0, 5) + "..."
    );

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    console.log(
      "Making request to Google Maps API with URL:",
      url.replace(apiKey, "REDACTED")
    );
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Maps API response not OK:", response.status);
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error("Failed to fetch from Google Maps API");
    }

    const data = await response.json();
    console.log("Google Maps API response status:", data.status);
    console.log("Full API response:", JSON.stringify(data, null, 2));

    // Check for specific error statuses
    if (data.status === "ZERO_RESULTS") {
      throw new Error(
        "No results found for the provided address. Please check the address and try again."
      );
    } else if (data.status === "OVER_QUERY_LIMIT") {
      throw new Error(
        "Google Maps API quota exceeded. Please try again later."
      );
    } else if (data.status === "REQUEST_DENIED") {
      throw new Error(
        "Google Maps API request denied. Please check API key configuration."
      );
    } else if (data.status === "INVALID_REQUEST") {
      throw new Error(
        "Invalid address format. Please check the address and try again."
      );
    } else if (data.status !== "OK") {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    if (!data.results?.[0]?.geometry?.location) {
      console.error("No results found in Google Maps API response:", data);
      throw new Error("No results found for the provided address");
    }

    const { lat, lng } = data.results[0].geometry.location;
    console.log("Successfully geocoded address:", { lat, lng });

    return NextResponse.json({ lat, lng });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to geocode address",
      },
      { status: 500 }
    );
  }
}
