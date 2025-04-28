#!/usr/bin/env node

/**
 * Helper script to set up environment variables for Court Finder
 * Usage: node setup-env.js --convex CONVEX_URL --clerk-pub CLERK_PUB_KEY --clerk-secret CLERK_SECRET_KEY --google GOOGLE_API_KEY
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};

for (let i = 0; i < args.length; i += 2) {
  if (args[i].startsWith("--") && i + 1 < args.length) {
    const key = args[i].substring(2);
    params[key] = args[i + 1];
  }
}

// Path to the environment file
const envPath = path.join(process.cwd(), ".env.local");

// Function to ask for input if not provided via command line
function askQuestion(question, defaultValue = "") {
  return new Promise((resolve) => {
    rl.question(
      `${question} ${defaultValue ? `(default: ${defaultValue})` : ""}: `,
      (answer) => {
        resolve(answer || defaultValue);
      }
    );
  });
}

async function promptForMissingValues() {
  console.log("\n=== Court Finder Environment Setup ===\n");

  if (!params["convex"]) {
    params["convex"] = await askQuestion(
      "Enter your Convex URL (from Convex dashboard)"
    );
  }

  if (!params["clerk-pub"]) {
    params["clerk-pub"] = await askQuestion("Enter your Clerk Publishable Key");
  }

  if (!params["clerk-secret"]) {
    params["clerk-secret"] = await askQuestion("Enter your Clerk Secret Key");
  }

  if (!params["google"]) {
    params["google"] = await askQuestion("Enter your Google Maps API Key");
  }

  rl.close();
}

// Function to create or update the .env.local file
function updateEnvFile() {
  let envContent;

  // Check if the file exists
  if (fs.existsSync(envPath)) {
    // Read existing file
    envContent = fs.readFileSync(envPath, "utf8");
    console.log("Updating existing .env.local file...");
  } else {
    // Create new file with template
    envContent = `# Court Finder Environment Variables
# Generated on ${new Date().toISOString()}
# DO NOT commit this file to version control

NODE_ENV=development
`;
    console.log("Creating new .env.local file...");
  }

  // Update or add Convex URL
  if (params["convex"]) {
    if (envContent.includes("NEXT_PUBLIC_CONVEX_URL=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONVEX_URL=.*$/m,
        `NEXT_PUBLIC_CONVEX_URL=${params["convex"]}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CONVEX_URL=${params["convex"]}`;
    }
  }

  // Update or add Clerk keys
  if (params["clerk-pub"]) {
    if (envContent.includes("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*$/m,
        `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${params["clerk-pub"]}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${params["clerk-pub"]}`;
    }
  }

  if (params["clerk-secret"]) {
    if (envContent.includes("CLERK_SECRET_KEY=")) {
      envContent = envContent.replace(
        /CLERK_SECRET_KEY=.*$/m,
        `CLERK_SECRET_KEY=${params["clerk-secret"]}`
      );
    } else {
      envContent += `\nCLERK_SECRET_KEY=${params["clerk-secret"]}`;
    }
  }

  // Update or add Google Maps API key
  if (params["google"]) {
    if (envContent.includes("GOOGLE_MAPS_API_KEY=")) {
      envContent = envContent.replace(
        /GOOGLE_MAPS_API_KEY=.*$/m,
        `GOOGLE_MAPS_API_KEY=${params["google"]}`
      );
    } else {
      envContent += `\nGOOGLE_MAPS_API_KEY=${params["google"]}`;
    }

    if (envContent.includes("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.*$/m,
        `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${params["google"]}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${params["google"]}`;
    }
  }

  // Add MongoDB connection string if not present
  if (!envContent.includes("MONGODB_URI=")) {
    envContent += `\nMONGODB_URI=mongodb://localhost:27017/pickleball_courts`;
  }

  // Write the updated content to the file
  fs.writeFileSync(envPath, envContent);
}

// Validate that required parameters are set
function validateParams() {
  const missingParams = [];

  if (!params["convex"]) missingParams.push("Convex URL");
  if (!params["clerk-pub"]) missingParams.push("Clerk Publishable Key");
  if (!params["clerk-secret"]) missingParams.push("Clerk Secret Key");

  if (missingParams.length > 0) {
    return false;
  }

  return true;
}

// Print completion instructions
function printInstructions() {
  console.log("\n✅ Environment setup complete!");
  console.log("\nNext steps:");
  console.log("1. Start the Convex development server:");
  console.log("   npm run convex");
  console.log(
    "\n2. In a separate terminal, start the Next.js development server:"
  );
  console.log("   npm run dev");
  console.log("\n3. Or use the combined dev command:");
  console.log("   npm run dev:all");
  console.log(
    "\n4. Visit http://localhost:3000/admin-setup to create your admin account"
  );
  console.log("\nEnjoy using Court Finder! 🎾🏓");
}

// Main function
async function main() {
  try {
    await promptForMissingValues();

    if (!validateParams()) {
      console.error("\n❌ Error: Some required parameters are missing.");
      process.exit(1);
    }

    updateEnvFile();
    printInstructions();
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
