import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" }); // Load .env.local first
dotenv.config(); // Then load .env if it exists

// Function to get Convex URL with validation
function getConvexUrl(): string {
  const deployment = process.env.CONVEX_DEPLOYMENT;
  if (!deployment) {
    throw new Error("CONVEX_DEPLOYMENT environment variable is not set");
  }

  // Extract the deployment name from the format "local:deployment-name" or "team:deployment-name"
  const deploymentName = deployment.split(":")[1];
  if (!deploymentName) {
    throw new Error(
      'Invalid CONVEX_DEPLOYMENT format. Expected format: "local:deployment-name" or "team:deployment-name"'
    );
  }

  // For local development, use the local Convex URL
  if (deployment.startsWith("local:")) {
    return "http://127.0.0.1:3210"; // Default local Convex URL
  }

  // For production deployments
  return `https://${deploymentName}.convex.cloud`;
}

async function main() {
  try {
    const convexUrl = getConvexUrl();
    console.log(`Using Convex URL: ${convexUrl}`);

    const convex = new ConvexClient(convexUrl);

    console.log("Patching courts to add source field...");
    await convex.mutation(api.courts.patchCourtsAddSource, {});
    console.log("Successfully patched all courts");
  } catch (error) {
    console.error("Patching failed:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
