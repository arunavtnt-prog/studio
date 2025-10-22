# Deployment Guide

## Quick Start

This project is ready to deploy! Follow these steps to get your 8origin Studios dashboard live.

## Prerequisites

Before deploying, you need to set up:

1. **Supabase Account** (free tier available)
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **OAuth Applications**
   - Google OAuth: https://console.cloud.google.com
   - Twitter/X OAuth: https://developer.twitter.com

3. **Email Service** (for notifications)
   - Gmail with app password, OR
   - SendGrid, Mailgun, etc.

## Step 1: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run all the SQL commands from `SCHEMA.md`
4. Verify tables were created in the Table Editor

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in all the required values:
   - Supabase credentials (from your Supabase project settings)
   - OAuth client IDs and secrets
   - Email server configuration
   - Admin email addresses (comma-separated)

3. Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Step 3: Test Locally

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 and test:
   - Landing page loads
   - Can sign in with email/OAuth
   - Can create an application
   - Admin panel works (if your email is in ADMIN_EMAILS)

## Step 4: Deploy to Vercel (Recommended)

1. Push your code to GitHub:
```bash
# Create a new GitHub repository, then:
git remote add origin <your-github-repo-url>
git push -u origin master
```

2. Go to https://vercel.com and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - Add all variables from `.env.local`
   - Update `NEXTAUTH_URL` to your production URL
   - Update `NEXT_PUBLIC_APP_URL` to your production URL

6. Deploy!

## Step 5: Configure OAuth Callback URLs

After deployment, update your OAuth applications:

### Google OAuth
1. Go to Google Cloud Console
2. Add authorized redirect URI:
   - `https://your-domain.vercel.app/api/auth/callback/google`

### Twitter/X OAuth
1. Go to Twitter Developer Portal
2. Add callback URL:
   - `https://your-domain.vercel.app/api/auth/callback/twitter`

## Step 6: Set Up Supabase Storage

1. In Supabase, go to Storage
2. Run the storage setup SQL from `SCHEMA.md`
3. Verify the `applications` bucket is created
4. Check that storage policies are in place

## Step 7: Configure Admin Access

1. Sign up on your deployed site with your admin email
2. In Supabase, run:
```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'your-admin-email@example.com';
```

## Alternative Deployment Options

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

### AWS Amplify
1. Connect your repository
2. Framework: Next.js - SSR
3. Add environment variables
4. Deploy

### Docker
```bash
# Build the image
docker build -t 8origin-dashboard .

# Run the container
docker run -p 3000:3000 --env-file .env.local 8origin-dashboard
```

## Post-Deployment Checklist

- [ ] Landing page loads correctly
- [ ] Email sign-in works
- [ ] Google OAuth works
- [ ] Twitter OAuth works
- [ ] Can create and submit applications
- [ ] File uploads work
- [ ] Email notifications are sent
- [ ] Admin panel is accessible (for admin users)
- [ ] All resource pages load
- [ ] Mobile responsive design works
- [ ] Application status updates work in admin panel

## Troubleshooting

### OAuth Errors
- Verify callback URLs match exactly (including https://)
- Check that client IDs and secrets are correct
- Ensure OAuth apps are set to "production" mode if required

### Database Errors
- Verify all migrations ran successfully
- Check Row Level Security policies are enabled
- Ensure Supabase service role key is correct (not anon key)

### Email Issues
- Test email server credentials
- Check spam folder
- Verify EMAIL_FROM address is allowed by your provider
- For Gmail, ensure "Less secure app access" or use app password

### File Upload Issues
- Check Supabase storage bucket exists
- Verify storage policies are configured
- Check file size limits (default 10MB)

## Security Notes

1. **Never commit `.env.local` or `.env` files**
2. **Rotate secrets regularly** (NEXTAUTH_SECRET, API keys)
3. **Use strong passwords** for admin accounts
4. **Enable 2FA** on your Supabase account
5. **Monitor admin access** and review logs regularly
6. **Set up rate limiting** for production (via Vercel, Cloudflare, etc.)

## Monitoring & Analytics

Consider adding:
- **Vercel Analytics** for performance monitoring
- **Sentry** for error tracking
- **Google Analytics** or **Plausible** for user analytics
- **Supabase monitoring** for database performance

## Support

For issues with deployment:
1. Check the logs in your deployment platform
2. Review the Supabase logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

## Scaling

As your application grows:
- Upgrade Supabase plan for more storage/bandwidth
- Enable Vercel Pro for better performance
- Add CDN for static assets
- Consider database indexing optimization
- Set up email queue system for large volumes

## Backup

Regular backups are important:
- Supabase provides automatic daily backups (paid plans)
- Export your database regularly using Supabase dashboard
- Back up your storage bucket
- Keep a copy of your environment variables securely

---

Congratulations! Your 8origin Studios dashboard should now be live and ready for creators to apply! 🎉
