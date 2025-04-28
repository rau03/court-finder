# Pickleball Court Finder USA

A web application to help users find pickleball courts across the United States.

## Features

- Search for courts by address, city, or state
- Filter courts by indoor/outdoor type
- Set search radius for location-based searches
- View court details including number of courts available
- User authentication with Clerk
- Admin approval system for court submissions

## Technology Stack

- Next.js 15 (App Router)
- React 19
- MongoDB with Mongoose
- Convex backend for user-submitted courts and admin features
- Clerk for authentication
- Tailwind CSS
- TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- MongoDB database (local or MongoDB Atlas)
- Clerk account for authentication
- Convex account for backend services
- Google Maps API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/court-finder.git
cd court-finder
```

2. Install dependencies

```bash
npm install
```

3. Set up your environment variables

#### Option 1: Using the setup script (Recommended)

We provide a setup script that will guide you through setting up your environment variables:

```bash
node setup-env.js
```

The script will interactively prompt you for:

- Convex URL (from your Convex dashboard)
- Clerk Publishable Key
- Clerk Secret Key
- Google Maps API Key

#### Option 2: Manual configuration

Create a `.env.local` file in the root directory with:

```
# MongoDB connection
MONGODB_URI=your_mongodb_connection_string

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Convex (Backend)
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Start the development servers

```bash
# Run both Convex and Next.js servers simultaneously
npm run dev:all

# Or run them separately in different terminals:
# Terminal 1: npm run convex
# Terminal 2: npm run dev
```

5. Set up the admin account
   Visit `http://localhost:3000/admin-setup` in your browser to create your admin account.

6. Seed the database with sample courts (optional)
   Visit `http://localhost:3000/api/seed?reset=true` in your browser

## Service Configuration

### Clerk Setup

1. Create a Clerk application at [clerk.dev](https://clerk.dev/)
2. Get your API keys from the Clerk dashboard
3. Configure your application URL and redirect URIs in the Clerk dashboard:
   - Add `http://localhost:3000` for development
   - Add your production URL for deployment

### Convex Setup

1. Create a Convex account and project at [convex.dev](https://convex.dev/)
2. Install the Convex CLI: `npm install -g convex`
3. Log in to Convex: `npx convex login`
4. Set up your Convex project: `npx convex init`
5. Get your Convex URL from the dashboard

### Google Maps API Setup

1. Create a Google Cloud project
2. Enable the Maps JavaScript API, Geocoding API, and Places API
3. Create an API key and restrict it to these APIs
4. For more details, see the [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) file

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository
2. Sign up for a [Vercel account](https://vercel.com)
3. Import your repository in Vercel
4. Configure environment variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `GOOGLE_MAPS_API_KEY`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
   - `PRODUCTION_URL` (your Vercel deployment URL)
5. Deploy your application

### Option 2: Deploy to a Custom Server

1. Build the application for production:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

3. Set up a reverse proxy (Nginx, Apache) to serve your application
4. Configure SSL with Let's Encrypt or another provider

### Option 3: Deploy to Docker

1. Build the Docker image:

```bash
docker build -t court-finder .
```

2. Run the container:

```bash
docker run -p 3000:3000 --env-file .env.production court-finder
```

## Usage

- Enter an address or select a state to find nearby courts
- Filter by indoor/outdoor courts
- Set maximum search distance when performing location-based searches
- Create an account to submit new courts
- Admins can approve or reject court submissions

## Troubleshooting

### Common Issues:

- **Authentication Errors**: Check your Clerk environment variables and make sure your application URLs are correctly configured in the Clerk dashboard.
- **Convex Connection Issues**: Ensure your Convex URL is correct and that your Convex development server is running.
- **Geocoding Failures**: Verify your Google Maps API key has the correct permissions and API services enabled.
- **Missing Courts**: Make sure you've set up an admin account and approved submitted courts.

## License

MIT
