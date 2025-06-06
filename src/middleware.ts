import { authMiddleware } from "@clerk/nextjs";

// Debug: Log middleware initialization
console.log("Initializing Clerk middleware");

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhook",
    "/api/courts/search",
    "/courts",
    "/sign-in",
    "/sign-up",
    "/api/geocode",
    "/submit-court",
  ],
  ignoredRoutes: [
    "/api/webhook",
    "/api/courts/search",
    "/api/geocode",
    "/((?!api|trpc))(_next|.+\\.[\\w]+$)",
  ],
  debug: true, // Enable debug mode
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return Response.redirect(signInUrl);
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
