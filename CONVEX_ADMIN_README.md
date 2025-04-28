# Pickleball Court Finder - Admin System

This document explains how to use the admin approval system for the Pickleball Court Finder app.

## Overview

The admin system allows authorized administrators to:

- Review court submissions
- Approve legitimate courts
- Reject inappropriate or duplicate submissions

## Setup Instructions

### 1. Install Dependencies

Make sure you have all dependencies installed:

```bash
npm install
# If you need concurrently for dev:all
npm install concurrently --save-dev
```

### 2. Start the Development Servers

Run both the Convex backend and Next.js frontend together:

```bash
npm run dev:all
```

Or separately:

```bash
# Terminal 1
npm run convex

# Terminal 2
npm run dev
```

### 3. Set Up Admin User

1. Create a Clerk account and log in to the app
2. Visit `/admin-setup` to make yourself an admin
   - The first user to access this page will automatically become an admin
   - After that, only existing admins can create new admins

### 4. Using the Admin Dashboard

1. After becoming an admin, a link to the admin dashboard will appear in the header
2. Visit `/admin` to access the admin dashboard
3. Review pending court submissions
4. Click "Approve" to make a court public or "Reject" to delete it

## Court Submission Flow

1. User submits a court through the "Submit Court" form
2. The court is saved with `isVerified: false`
3. Admins see unverified courts on the admin dashboard
4. After approval, the court appears in search results with `isVerified: true`

## Troubleshooting

- **Authentication Issues**: Make sure Clerk is properly configured
- **Database Issues**: Check Convex dashboard for errors
- **TypeScript Errors**: Run `npm run lint` to identify and fix type issues

## Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.com/docs)
