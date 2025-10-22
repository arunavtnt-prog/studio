# 8origin Studios Dashboard

A responsive web dashboard for creators to apply to and track their participation in the 8origin Studios accelerator program.

## Features

- **Landing Page**: Hero section with tagline and navigation
- **User Authentication**: Email, Google, and Twitter/X login support
- **Creator Dashboard**: Track application status and submit new applications
- **Application Form**: Capture creator information, pitch details, and upload media kits
- **Admin Panel**: Manage applications, add notes, and track submissions
- **Resources Section**: Public pages for About Us, Partnerships, Our Work, and Pitch Deck
- **Email Notifications**: Automatic confirmation emails on application submission
- **File Upload**: Support for PDF pitch decks and media kits

## Tech Stack

- **Frontend**: Next.js 16 with App Router, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with multiple providers
- **Database & Storage**: Supabase (PostgreSQL + Storage)
- **Email**: Nodemailer
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OAuth credentials (Google, Twitter/X)
- SMTP server for emails (Gmail works)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure your `.env.local` file with:
   - Supabase credentials
   - OAuth provider credentials
   - Email server settings
   - Admin email addresses

### Database Setup

For detailed database schema, see [SCHEMA.md](./SCHEMA.md)

Run the SQL migrations in your Supabase SQL editor to set up the database tables.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment

This application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

Make sure to:
1. Set all environment variables in your deployment platform
2. Configure OAuth redirect URLs for production domain
3. Set up Supabase storage CORS policies
4. Configure email server for production use

## Project Structure

```
8origin-dashboard/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (public)/        # Public pages (landing, about, etc.)
│   ├── dashboard/       # Creator dashboard
│   ├── admin/           # Admin panel
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── layouts/         # Layout components
├── lib/
│   ├── supabase/        # Database client and queries
│   ├── auth/            # Authentication configuration
│   └── utils/           # Utility functions
└── types/               # TypeScript type definitions
```

## Configuration

### OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### Twitter/X OAuth
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Enable OAuth 2.0
4. Add callback URL: `http://localhost:3000/api/auth/callback/twitter`

### Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and anon key
3. Run the database migration (see SCHEMA.md)
4. Configure storage bucket for file uploads
5. Set up storage policies for authenticated users

### Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use app password in `EMAIL_SERVER_PASSWORD`

## Admin Access

To grant admin access:
1. Add email addresses to `ADMIN_EMAILS` in `.env.local`
2. Users with these emails will see the admin panel

## Features by Page

### Landing Page (/)
- Hero section with tagline
- Call-to-action buttons
- Responsive navigation
- Footer with links

### Creator Dashboard (/dashboard)
- Application status display
- New application form
- Progress tracking
- File upload for pitch decks

### Admin Panel (/admin)
- Application list with filters
- Status management
- Notes and tagging system
- Sortable columns

### Resources Pages
- /about - About 8origin Studios
- /work - Portfolio and case studies
- /partnerships - Partnership information
- /pitch - Pitch deck information

## Security

- All routes protected with NextAuth.js
- Admin routes restricted by email whitelist
- File uploads validated and size-limited
- SQL injection prevention via Supabase client
- CSRF protection via NextAuth.js

## Support

For issues or questions, contact team@8origin.com
