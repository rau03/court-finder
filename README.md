# Pickleball Court Hub - Court Finder

A modern web application that helps pickleball players find and discover courts in their area. Built with Next.js, TypeScript, and Google Maps API.

## Features

- 🔍 Search for pickleball courts near you
- 🗺️ Interactive map interface
- 📍 Real-time court locations and availability
- 🔐 User authentication with Clerk
- 💾 Real-time database with Convex
- 🎨 Modern UI with Tailwind CSS

## Vision & Future Features

Court Finder aims to be more than just a court locator - it's building a comprehensive pickleball community platform. Here's what we're planning to build:

### Community Features

- 👥 **Court Check-ins**: Players can check in at courts to show who's currently playing
- 💬 **Community Chat**: A dedicated space for pickleball enthusiasts to connect and organize games
- ⭐ **Court Reviews & Ratings**: User-generated reviews and ratings for courts, including:
  - Court conditions
  - Amenities
  - Peak hours
  - Skill level of regular players
  - Parking information

### AI Integration (Coming Soon)

- 🤖 **Smart Court Recommendations**: AI-powered suggestions based on:
  - Player skill level
  - Preferred playing times
  - Court availability
  - Weather conditions
  - Community activity

### Enhanced User Experience

- 📱 **Real-time Updates**: Live information about court conditions and player presence
- 🎯 **Skill-based Matching**: Find players of similar skill levels
- 📅 **Game Scheduling**: Organize and join pickup games
- 🌦️ **Weather Integration**: Real-time weather updates for outdoor courts

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Convex
- **Maps**: Google Maps API
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud account (for Maps API)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/court-finder.git
   cd court-finder
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`
   - Add your Google Maps API key (see [Google Maps Setup Guide](GOOGLE_MAPS_SETUP.md))
   - Add your Clerk credentials

4. Run the development server:

   ```bash
   npm run dev:all
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run convex` - Start Convex development server
- `npm run dev:all` - Start both Next.js and Convex servers concurrently
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run setup` - Run environment setup script
- `npm run migrate` - Run database migration script

## Project Structure

```
court-finder/
├── src/              # Source files
├── convex/           # Convex database and functions
├── public/           # Static assets
├── scripts/          # Utility scripts
└── ...config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Convex](https://www.convex.dev/)
- [Clerk](https://clerk.dev/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Tailwind CSS](https://tailwindcss.com/)
