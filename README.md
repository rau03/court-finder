# Pickleball Court Hub - Court Finder

A modern web application that helps pickleball players find and discover courts in their area. Built with Next.js, TypeScript, and Google Maps API.

## ✨ Current Features

### 🔍 Core Functionality

- **Court Search**: Advanced search with location-based filtering, indoor/outdoor preferences, and distance radius
- **Interactive Map**: Real-time map interface powered by Google Maps API showing court locations
- **Court Details**: Comprehensive court information including amenities, surface type, hours, and contact info
- **User-Generated Content**: Community-driven court submissions with admin approval process

### 👤 User Features

- **Authentication**: Secure user authentication powered by Clerk
- **Favorites System**: Save and manage favorite courts for quick access
- **Court Submission**: Submit new courts with detailed information and location data
- **Responsive Design**: Mobile-friendly interface with modern UI components

### ⚡ Admin Features

- **Admin Dashboard**: Dedicated admin interface for court management
- **Court Approval**: Review and approve user-submitted courts
- **User Management**: Admin user role management system

### 🗄️ Data Management

- **Real-time Database**: Powered by Convex for real-time data synchronization
- **Location-based Queries**: Efficient geographic searches using coordinate indexing
- **Court Verification**: System for tracking verified vs. user-submitted courts

## 🎯 Future Features & Roadmap

### Community Features (Planned)

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

### Enhanced User Experience (Planned)

- 📱 **Real-time Updates**: Live information about court conditions and player presence
- 🎯 **Skill-based Matching**: Find players of similar skill levels
- 📅 **Game Scheduling**: Organize and join pickup games
- 🌦️ **Weather Integration**: Real-time weather updates for outdoor courts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Clerk
- **Database**: Convex (real-time database)
- **Maps**: Google Maps API (@react-google-maps/api)
- **UI Components**: Lucide React icons
- **Development**: Concurrently for running multiple dev servers

## 📁 Project Structure

```
court-finder/
├── src/
│   ├── app/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── CourtCard.tsx
│   │   │   ├── CourtList.tsx
│   │   │   ├── CourtResults.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Map.tsx
│   │   │   ├── MapWrapper.tsx
│   │   │   ├── SearchForm.tsx
│   │   │   └── SubmitCourtForm.tsx
│   │   ├── context/           # React context providers
│   │   ├── providers/         # App-level providers
│   │   ├── admin/            # Admin dashboard
│   │   ├── favorites/        # User favorites page
│   │   ├── submit-court/     # Court submission page
│   │   ├── sign-in/          # Authentication pages
│   │   ├── sign-up/
│   │   └── api/              # API routes
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript type definitions
├── convex/                   # Backend database functions
│   ├── courts.ts            # Court management functions
│   ├── favorites.ts         # User favorites functionality
│   ├── users.ts             # User management
│   ├── auth.ts              # Authentication config
│   └── schema.ts            # Database schema
├── scripts/                 # Utility scripts
└── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud account (for Maps API)
- Clerk account (for authentication)
- Convex account (for database)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/court-finder.git
   cd court-finder
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file with the following variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Google Maps API
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Convex Database
   CONVEX_DEPLOYMENT=your_convex_deployment_url
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   ```

4. **Set up Convex**:

   ```bash
   npx convex dev
   ```

5. **Run the development server**:

   ```bash
   npm run dev:all
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run convex` - Start Convex development server
- `npm run dev:all` - Start both Next.js and Convex servers concurrently
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run setup` - Run environment setup script
- `npm run migrate` - Run database migration script

## 🗃️ Database Schema

### Courts

- Location data with geographic indexing
- Amenities (indoor/outdoor, lights, restrooms, etc.)
- Contact information and hours
- Verification status and user submission tracking

### Users

- Clerk authentication integration
- Role-based access control (admin/user)
- User profile management

### Favorites

- User-court relationship tracking
- Quick access to saved courts

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Convex](https://www.convex.dev/) - Real-time database
- [Clerk](https://clerk.dev/) - Authentication
- [Google Maps Platform](https://developers.google.com/maps) - Maps and geocoding
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide React](https://lucide.dev/) - Icon library
