#!/usr/bin/env node

/**
 * Helper script to update the .env.local file with the Google Maps API key
 * Usage: node update-env.js YOUR_GOOGLE_MAPS_API_KEY
 */

const fs = require("fs");
const path = require("path");

const apiKey = process.argv[2];

if (!apiKey) {
  console.error("\x1b[31mError: Please provide a Google Maps API key\x1b[0m");
  console.log(
    "\x1b[36mUsage: node update-env.js YOUR_GOOGLE_MAPS_API_KEY\x1b[0m"
  );
  process.exit(1);
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
GOOGLE_MAPS_API_KEY=${apiKey}
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${apiKey}
NODE_ENV=development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cG9wdWxhci1iYXQtNjIuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log(
    "\x1b[32mSuccess! Created .env.local with your Google Maps API key.\x1b[0m"
  );
  process.exit(0);
}

// Read the existing file
try {
  let envContent = fs.readFileSync(envPath, "utf8");

  // Replace the Google Maps API keys
  envContent = envContent.replace(
    /GOOGLE_MAPS_API_KEY=.*$/m,
    `GOOGLE_MAPS_API_KEY=${apiKey}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.*$/m,
    `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${apiKey}`
  );

  // Write the updated file
  fs.writeFileSync(envPath, envContent);
  console.log(
    "\x1b[32mSuccess! Updated .env.local with your Google Maps API key.\x1b[0m"
  );
} catch (error) {
  console.error(
    "\x1b[31mError updating .env.local file:\x1b[0m",
    error.message
  );
  process.exit(1);
}
