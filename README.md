# Pickleball Court Finder USA

A web application to help users find pickleball courts across the United States.

## Features

- Search for courts by address, city, or state
- Filter courts by indoor/outdoor type
- Set search radius for location-based searches
- View court details including number of courts available

## Technology Stack

- Next.js 15 (App Router)
- React 19
- MongoDB with Mongoose
- Tailwind CSS
- TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- MongoDB database (local or MongoDB Atlas)

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

3. Set up environment variables
   Create a `.env.local` file in the root directory with:

```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Run the development server

```bash
npm run dev
```

5. Seed the database with sample courts
   Visit `http://localhost:3000/api/seed?reset=true` in your browser

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository
2. Sign up for a [Vercel account](https://vercel.com)
3. Import your repository in Vercel
4. Configure environment variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
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

## License

MIT
