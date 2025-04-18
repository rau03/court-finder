import { clerkMiddleware } from "@clerk/nextjs/server";

// Initialize Clerk middleware
export default clerkMiddleware();

export const config = {
  // Runs the middleware on all routes
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
