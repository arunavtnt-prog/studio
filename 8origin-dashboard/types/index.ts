export type ApplicationStatus =
  | "not_submitted"
  | "under_review"
  | "accepted"
  | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  creator_name: string;
  youtube_handle: string | null;
  tiktok_handle: string | null;
  instagram_handle: string | null;
  youtube_followers: number | null;
  tiktok_followers: number | null;
  instagram_followers: number | null;
  website: string | null;
  project_idea: string;
  target_audience: string;
  why_join: string;
  pitch_deck_url: string | null;
  media_kit_url: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  tags: string[] | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationActivity {
  id: string;
  application_id: string;
  user_id: string;
  action: string;
  details: Record<string, any> | null;
  created_at: string;
}

export interface ApplicationFormData {
  creator_name: string;
  youtube_handle?: string;
  tiktok_handle?: string;
  instagram_handle?: string;
  youtube_followers?: number;
  tiktok_followers?: number;
  instagram_followers?: number;
  website?: string;
  project_idea: string;
  target_audience: string;
  why_join: string;
  pitch_deck?: File;
  media_kit?: File;
}
