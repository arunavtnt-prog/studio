# Database Schema

This document describes the Supabase database schema for the 8origin Studios Dashboard.

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands below in order
4. Set up storage bucket and policies

## SQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extended from auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Applications table
CREATE TABLE public.applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Creator information
  creator_name TEXT NOT NULL,
  youtube_handle TEXT,
  tiktok_handle TEXT,
  instagram_handle TEXT,
  youtube_followers INTEGER,
  tiktok_followers INTEGER,
  instagram_followers INTEGER,
  website TEXT,

  -- Application details
  project_idea TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  why_join TEXT NOT NULL,

  -- File uploads
  pitch_deck_url TEXT,
  media_kit_url TEXT,

  -- Status tracking
  status TEXT DEFAULT 'not_submitted' CHECK (status IN ('not_submitted', 'under_review', 'accepted', 'rejected')),

  -- Admin notes
  admin_notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all applications"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Resources/Content table (for CMS-like functionality)
CREATE TABLE public.content_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- Content pages policies
CREATE POLICY "Anyone can view published content"
  ON public.content_pages FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Admins can manage content"
  ON public.content_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Application activity log
CREATE TABLE public.application_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.application_activities ENABLE ROW LEVEL SECURITY;

-- Activity policies
CREATE POLICY "Admins can view all activities"
  ON public.application_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Users can view their application activities"
  ON public.application_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_pages_updated_at
  BEFORE UPDATE ON public.content_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default content pages
INSERT INTO public.content_pages (slug, title, content) VALUES
  ('about', 'About Us', 'Welcome to 8origin Studios - Empowering New-Gen Creator Brands. We are a creator accelerator program dedicated to helping digital creators build sustainable businesses and brands.'),
  ('work', 'Our Work', 'Discover the amazing creators and brands we''ve helped launch and grow.'),
  ('partnerships', 'Partnerships', 'We partner with leading brands and platforms to provide our creators with the best opportunities and resources.'),
  ('pitch', 'Pitch Deck', 'Learn more about our program, vision, and how we support creators in building their brands.');
```

## Storage Setup

1. Create a storage bucket named `applications`:
```sql
-- Run this in Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('applications', 'applications', false);
```

2. Set up storage policies:
```sql
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'applications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'applications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all files
CREATE POLICY "Admins can view all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'applications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Admin Setup

To make a user an admin, run this SQL (replace the email):

```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'admin@8origin.com';
```

## Indexes for Performance

```sql
-- Index on application status for filtering
CREATE INDEX idx_applications_status ON public.applications(status);

-- Index on application submission date
CREATE INDEX idx_applications_submitted_at ON public.applications(submitted_at DESC);

-- Index on user applications
CREATE INDEX idx_applications_user_id ON public.applications(user_id);

-- Index on content page slugs
CREATE INDEX idx_content_pages_slug ON public.content_pages(slug);
```

## Database Schema Diagram

```
┌─────────────────┐
│  auth.users     │
│  (Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   profiles      │
├─────────────────┤
│ id (PK)         │
│ email           │
│ full_name       │
│ avatar_url      │
│ is_admin        │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│   applications      │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ creator_name        │
│ social_handles      │
│ project_idea        │
│ status              │
│ admin_notes         │
│ tags[]              │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌──────────────────────┐
│ application_         │
│ activities           │
├──────────────────────┤
│ id (PK)              │
│ application_id (FK)  │
│ user_id (FK)         │
│ action               │
│ details              │
└──────────────────────┘

┌──────────────────────┐
│  content_pages       │
├──────────────────────┤
│ id (PK)              │
│ slug                 │
│ title                │
│ content              │
│ published            │
└──────────────────────┘
```

## Notes

- All tables use Row Level Security (RLS) for data protection
- Files are stored in Supabase Storage with path pattern: `{user_id}/{filename}`
- Automatic profile creation on user signup via trigger
- Timestamps are automatically updated via triggers
- Admin access is controlled via the `is_admin` flag in profiles
