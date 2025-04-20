# Google Maps API Setup Guide

## Introduction

This guide will help you set up the Google Maps APIs required for this application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make note of your project ID

## Step 2: Enable the Required APIs

1. In your Google Cloud project, navigate to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Maps JavaScript API** - Used for displaying maps on web pages
   - **Geocoding API** - Used for converting addresses to coordinates

## Step 3: Create API Keys

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "API Key"
3. A new API key will be created. Copy this key
4. (Optional but recommended) Restrict your API key:
   - Click on the newly created API key
   - Under "Application restrictions", you can restrict to websites, IP addresses, etc.
   - Under "API restrictions", restrict to only the APIs you enabled

## Step 4: Add API Keys to Your Environment

1. Open your `.env.local` file
2. Update the following variables with your API key:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## Step 5: Verify Setup

1. Run your application
2. Try searching for a location like "Nashville, TN"
3. If the map loads and geocoding works, your setup is complete!

## Troubleshooting

- If you see "The provided API key is invalid" errors, double-check that:

  - You copied the API key correctly
  - The APIs are enabled in your project
  - Your billing is set up (if required)
  - Any API restrictions are properly configured

- If you need to debug API calls:
  - Check the Network tab in your browser's dev tools
  - Look for requests to googleapis.com
  - Check the console for detailed error messages

## Usage Limits and Billing

- Google Maps Platform offers a $200 monthly credit, which is enough for most small applications
- Monitor your usage in the Google Cloud Console to avoid unexpected charges
- Consider setting up billing alerts
