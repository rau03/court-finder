#!/bin/bash

# Exit on error
set -e

echo "🚀 Deploying Court Finder to production..."

# Build the application
echo "📦 Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi

# Start the production server
echo "🌐 Starting production server..."
NODE_ENV=production npm start

echo "✅ Deployment complete!" 