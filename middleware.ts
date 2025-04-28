import { NextResponse } from "next/server";
import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Simple rate limiter for API routes
const apiRateLimiter = {
  requests: new Map<string, { count: number; resetTime: number }>(),

  // Configure rate limits - could move to env variables for easier adjustment
  maxRequests: 100, // Max 100 requests
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

  // Clean up old entries periodically (called by middleware)
  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(ip);
      }
    }
  },
};

// Clean up periodically (will run when middleware is invoked)
if (apiRateLimiter.requests.size > 1000) {
  // Only clean if there are many entries
  apiRateLimiter.cleanup();
}

// Export main middleware combining both Clerk and API rate limiting
export default async function middleware(request: NextRequest) {
  // Apply API rate limiting for /api routes only
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  if (isApiRoute) {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

    // Check if authenticated - authenticated users get higher limits
    const auth = getAuth(request);
    const isAuthenticated = auth.userId !== null;

    // Only apply rate limiting to non-authenticated API requests or exceed higher limits
    if (!isAuthenticated && apiRateLimiter.isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Continue with Clerk middleware
  return clerkMiddleware()(request);
}

export const config = {
  // Runs the middleware on all routes
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
