# Push to GitHub

## Option 1: Create New GitHub Repository (Recommended)

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `8origin-dashboard`
3. Description: "Creator accelerator dashboard for 8origin Studios"
4. Set to Private or Public (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 2: Push Your Code
```bash
cd /home/user/studio/8origin-dashboard

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/8origin-dashboard.git

# Push to GitHub
git push -u origin master
```

### Step 3: Verify
Visit your GitHub repository and verify all files are there.

---

## Option 2: Add to Existing Studio Repository

If you want to add this as a subdirectory in your existing studio repository:

```bash
# Go to parent directory
cd /home/user/studio

# Copy the 8origin-dashboard directory (already exists)
# Create and checkout the specified branch
git checkout -b claude/create-8origin-dashboard-011CUNNkaK9Hngs12gp6EfvA

# Add the 8origin-dashboard folder
git add 8origin-dashboard/

# Commit
git commit -m "Add 8origin Studios creator dashboard

Complete creator accelerator platform with:
- User authentication (Email, Google, Twitter/X)
- Creator dashboard with application tracking
- Admin panel for managing applications
- File upload support for pitch decks
- Email notifications
- Resource pages

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to the branch
git push -u origin claude/create-8origin-dashboard-011CUNNkaK9Hngs12gp6EfvA
```

---

## Option 3: Deploy Without GitHub

You can deploy directly from local files:

### Vercel
```bash
npm install -g vercel
cd /home/user/studio/8origin-dashboard
vercel
```

Follow the prompts to deploy.

---

## After Pushing to GitHub

1. **Set up Supabase**
   - Create project at https://supabase.com
   - Run SQL from `SCHEMA.md`
   - Get your API keys

2. **Configure OAuth Apps**
   - Google: https://console.cloud.google.com
   - Twitter: https://developer.twitter.com

3. **Deploy to Vercel**
   - Import from GitHub
   - Add environment variables
   - Deploy!

4. **Update OAuth Callbacks**
   - Add production URLs to OAuth apps

5. **Make yourself admin**
   - Sign up on your deployed site
   - Update your profile in Supabase to `is_admin = true`

---

## Repository Structure

Your repository includes:

```
8origin-dashboard/
├── README.md              # Project documentation
├── SCHEMA.md              # Database setup
├── DEPLOYMENT.md          # Deployment guide
├── SETUP.md               # Quick start guide
├── .env.example           # Environment template
├── app/                   # Next.js pages and API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript definitions
```

All code is committed and ready to push!
