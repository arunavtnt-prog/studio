import { supabase } from "./client";
import { supabaseAdmin } from "./server";
import type { Application, Profile, ContentPage, ApplicationStatus } from "@/types";

// Profile queries
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }

  return data;
}

// Application queries
export async function getUserApplications(userId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    return [];
  }

  return data || [];
}

export async function getApplication(id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, profile:profiles(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching application:", error);
    return null;
  }

  return data;
}

export async function createApplication(
  application: Omit<Application, "id" | "created_at" | "updated_at" | "submitted_at">
): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .insert(application)
    .select()
    .single();

  if (error) {
    console.error("Error creating application:", error);
    return null;
  }

  return data;
}

export async function updateApplication(
  id: string,
  updates: Partial<Application>
): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating application:", error);
    return null;
  }

  return data;
}

export async function submitApplication(id: string): Promise<Application | null> {
  return updateApplication(id, {
    status: "under_review",
    submitted_at: new Date().toISOString(),
  });
}

// Admin queries
export async function getAllApplications(): Promise<Application[]> {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select("*, profile:profiles(*)")
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Error fetching all applications:", error);
    return [];
  }

  return data || [];
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  adminNotes?: string
): Promise<Application | null> {
  const updates: Partial<Application> = { status };
  if (adminNotes !== undefined) {
    updates.admin_notes = adminNotes;
  }

  const { data, error } = await supabaseAdmin
    .from("applications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating application status:", error);
    return null;
  }

  return data;
}

export async function addApplicationTags(
  id: string,
  tags: string[]
): Promise<Application | null> {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .update({ tags })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error adding tags:", error);
    return null;
  }

  return data;
}

// Content queries
export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const { data, error } = await supabase
    .from("content_pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    console.error("Error fetching content page:", error);
    return null;
  }

  return data;
}

export async function getAllContentPages(): Promise<ContentPage[]> {
  const { data, error } = await supabase
    .from("content_pages")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching content pages:", error);
    return [];
  }

  return data || [];
}

export async function updateContentPage(
  id: string,
  updates: Partial<ContentPage>
): Promise<ContentPage | null> {
  const { data, error } = await supabaseAdmin
    .from("content_pages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating content page:", error);
    return null;
  }

  return data;
}

// File upload
export async function uploadFile(
  userId: string,
  file: File,
  type: "pitch_deck" | "media_kit"
): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("applications")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading file:", error);
    return null;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("applications").getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteFile(filePath: string): Promise<boolean> {
  const { error } = await supabase.storage.from("applications").remove([filePath]);

  if (error) {
    console.error("Error deleting file:", error);
    return false;
  }

  return true;
}
