#!/usr/bin/env node

/**
 * Helper script to update the .env.local file with API keys
 * Usage: node update-env.js --google YOUR_GOOGLE_API_KEY --pickleball YOUR_PICKLEBALL_API_KEY
 */

const fs = require("fs");
const path = require("path");

// Parse arguments
let googleApiKey = null;
let pickleballApiKey = null;

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--google" && i + 1 < process.argv.length) {
    googleApiKey = process.argv[i + 1];
    i++; // Skip next arg
  } else if (process.argv[i] === "--pickleball" && i + 1 < process.argv.length) {
    pickleballApiKey = process.argv[i + 1];
    i++; // Skip next arg
  }
}

// Check for old format (just positional arg)
if (!googleApiKey && process.argv[2] && !process.argv[2].startsWith("--")) {
  googleApiKey = process.argv[2];
  console.log("\x1b[33mWarning: Using deprecated argument format. Please use --google API_KEY in the future.\x1b[0m");
}

// Path to the environment file
const envPath = path.join(process.cwd(), ".env.local");

// Check if the file exists
if (!fs.existsSync(envPath)) {
  console.log(
    "\x1b[33mWarning: .env.local file not found. Creating a new one.\x1b[0m"
  );

  // Create basic template
  const envTemplate = `# Sensitive information - Do not expose these keys in version control
MONGODB_URI=mongodb://localhost:27017/pickleball_courts
GOOGLE_MAPS_API_KEY=${googleApiKey || ""}
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${googleApiKey || ""}
PICKLEBALL_API_KEY=${pickleballApiKey || ""}
NODE_ENV=development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cG9wdWxhci1iYXQtNjIuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log(
    "\x1b[32mSuccess! Created .env.local with your API keys.\x1b[0m"
  );
  process.exit(0);
}

// Read the existing file
try {
  let envContent = fs.readFileSync(envPath, "utf8");

  // Update the Google Maps API keys if provided
  if (googleApiKey) {
    if (envContent.includes("GOOGLE_MAPS_API_KEY=")) {
      envContent = envContent.replace(
        /GOOGLE_MAPS_API_KEY=.*$/m,
        `GOOGLE_MAPS_API_KEY=${googleApiKey}`
      );
    } else {
      envContent += `\nGOOGLE_MAPS_API_KEY=${googleApiKey}`;
    }

    if (envContent.includes("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.*$/m,
        `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${googleApiKey}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${googleApiKey}`;
    }
  }

  // Update the Pickleball API key if provided
  if (pickleballApiKey) {
    if (envContent.includes("PICKLEBALL_API_KEY=")) {
      envContent = envContent.replace(
        /PICKLEBALL_API_KEY=.*$/m,
        `PICKLEBALL_API_KEY=${pickleballApiKey}`
      );
    } else {
      envContent += `\nPICKLEBALL_API_KEY=${pickleballApiKey}`;
    }
  }

  // Write the updated file
  fs.writeFileSync(envPath, envContent);
  console.log(
    "\x1b[32mSuccess! Updated .env.local with your API keys.\x1b[0m"
  );
} catch (error) {
  console.error(
    "\x1b[31mError updating .env.local file:\x1b[0m",
    error.message
  );
  process.exit(1);
}
