import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/auth.config";
import {
  getUserApplications,
  createApplication,
  getAllApplications,
  submitApplication,
} from "@/lib/supabase/queries";
import { uploadFile } from "@/lib/supabase/queries";
import { sendApplicationConfirmation, sendAdminNotification } from "@/lib/email/mailer";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin (for getting all applications)
  const url = new URL(request.url);
  const isAdmin = url.searchParams.get("admin") === "true";

  if (isAdmin && session.user.isAdmin) {
    const applications = await getAllApplications();
    return NextResponse.json(applications);
  }

  // Get user's own applications
  const applications = await getUserApplications(session.user.id);
  return NextResponse.json(applications);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    // Extract form fields
    const data = {
      user_id: session.user.id,
      creator_name: formData.get("creator_name") as string,
      youtube_handle: formData.get("youtube_handle") as string | null,
      tiktok_handle: formData.get("tiktok_handle") as string | null,
      instagram_handle: formData.get("instagram_handle") as string | null,
      youtube_followers: formData.get("youtube_followers")
        ? parseInt(formData.get("youtube_followers") as string)
        : null,
      tiktok_followers: formData.get("tiktok_followers")
        ? parseInt(formData.get("tiktok_followers") as string)
        : null,
      instagram_followers: formData.get("instagram_followers")
        ? parseInt(formData.get("instagram_followers") as string)
        : null,
      website: formData.get("website") as string | null,
      project_idea: formData.get("project_idea") as string,
      target_audience: formData.get("target_audience") as string,
      why_join: formData.get("why_join") as string,
      pitch_deck_url: null,
      media_kit_url: null,
      status: "not_submitted" as const,
      admin_notes: null,
      tags: null,
    };

    // Handle file uploads
    const pitchDeck = formData.get("pitch_deck") as File | null;
    const mediaKit = formData.get("media_kit") as File | null;

    if (pitchDeck) {
      const url = await uploadFile(session.user.id, pitchDeck, "pitch_deck");
      if (url) data.pitch_deck_url = url;
    }

    if (mediaKit) {
      const url = await uploadFile(session.user.id, mediaKit, "media_kit");
      if (url) data.media_kit_url = url;
    }

    // Create the application
    const application = await createApplication(data);

    if (!application) {
      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 }
      );
    }

    // Submit the application immediately
    const submittedApp = await submitApplication(application.id);

    // Send confirmation email
    await sendApplicationConfirmation(
      session.user.email!,
      data.creator_name
    );

    // Send admin notification
    await sendAdminNotification(application.id, data.creator_name);

    return NextResponse.json(submittedApp, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
