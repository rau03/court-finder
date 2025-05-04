import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

// Simple rate limiter for API routes
const rateLimit = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const now = Date.now();
    const rateLimitInfo = rateLimit.get(ip);

    if (rateLimitInfo) {
      if (now - rateLimitInfo.timestamp < RATE_LIMIT_WINDOW) {
        if (rateLimitInfo.count >= MAX_REQUESTS) {
          return new NextResponse("Too many requests", {
            status: 429,
            headers: {
              "Retry-After": "60",
            },
          });
        }
        rateLimitInfo.count++;
      } else {
        rateLimitInfo.count = 1;
        rateLimitInfo.timestamp = now;
      }
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }
  }

  // Apply Clerk authentication middleware
  return clerkMiddleware()(request, event);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
