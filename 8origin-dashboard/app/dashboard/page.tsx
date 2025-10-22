"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import type { Application, ApplicationFormData } from "@/types";

const applicationSchema = z.object({
  creator_name: z.string().min(2, "Name must be at least 2 characters"),
  youtube_handle: z.string().optional(),
  tiktok_handle: z.string().optional(),
  instagram_handle: z.string().optional(),
  youtube_followers: z.number().optional(),
  tiktok_followers: z.number().optional(),
  instagram_followers: z.number().optional(),
  website: z.string().url().optional().or(z.literal("")),
  project_idea: z.string().min(50, "Please provide at least 50 characters"),
  target_audience: z.string().min(30, "Please provide at least 30 characters"),
  why_join: z.string().min(50, "Please provide at least 50 characters"),
});

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [mediaKit, setMediaKit] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchApplications();
    }
  }, [status, router]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      if (pitchDeck) formData.append("pitch_deck", pitchDeck);
      if (mediaKit) formData.append("media_kit", mediaKit);

      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        reset();
        setPitchDeck(null);
        setMediaKit(null);
        setShowForm(false);
        await fetchApplications();
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_submitted":
        return <Clock className="w-5 h-5" />;
      case "under_review":
        return <Clock className="w-5 h-5" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5" />;
      case "rejected":
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not_submitted":
        return <Badge variant="secondary">Draft</Badge>;
      case "under_review":
        return <Badge variant="warning">Under Review</Badge>;
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Not Selected</Badge>;
      default:
        return null;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {session?.user?.name || session?.user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track your application status and manage your creator profile
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length > 0 ? (
            applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{app.creator_name}</CardTitle>
                      <CardDescription>
                        Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Not submitted"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(app.status)}
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">{app.project_idea.substring(0, 150)}...</p>
                    <div className="flex gap-2 flex-wrap">
                      {app.youtube_handle && (
                        <Badge variant="outline">YouTube: {app.youtube_handle}</Badge>
                      )}
                      {app.tiktok_handle && (
                        <Badge variant="outline">TikTok: {app.tiktok_handle}</Badge>
                      )}
                      {app.instagram_handle && (
                        <Badge variant="outline">Instagram: {app.instagram_handle}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Applications Yet</CardTitle>
                <CardDescription>
                  Start your journey by creating your first application
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* New Application Button/Form */}
        {!showForm ? (
          <div className="mt-6">
            <Button size="lg" variant="gradient" onClick={() => setShowForm(true)}>
              Create New Application
            </Button>
          </div>
        ) : (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>New Application</CardTitle>
              <CardDescription>
                Tell us about yourself and your creator brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Basic Information</h3>
                  <div>
                    <Label htmlFor="creator_name">Creator Name *</Label>
                    <Input
                      id="creator_name"
                      {...register("creator_name")}
                      placeholder="Your name or brand name"
                    />
                    {errors.creator_name && (
                      <p className="text-sm text-red-600 mt-1">{errors.creator_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Social Channels */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Social Channels</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="youtube_handle">YouTube Handle</Label>
                      <Input
                        id="youtube_handle"
                        {...register("youtube_handle")}
                        placeholder="@yourchannel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube_followers">YouTube Followers</Label>
                      <Input
                        id="youtube_followers"
                        type="number"
                        {...register("youtube_followers", { valueAsNumber: true })}
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok_handle">TikTok Handle</Label>
                      <Input
                        id="tiktok_handle"
                        {...register("tiktok_handle")}
                        placeholder="@youraccount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok_followers">TikTok Followers</Label>
                      <Input
                        id="tiktok_followers"
                        type="number"
                        {...register("tiktok_followers", { valueAsNumber: true })}
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram_handle">Instagram Handle</Label>
                      <Input
                        id="instagram_handle"
                        {...register("instagram_handle")}
                        placeholder="@yourprofile"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram_followers">Instagram Followers</Label>
                      <Input
                        id="instagram_followers"
                        type="number"
                        {...register("instagram_followers", { valueAsNumber: true })}
                        placeholder="25000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      {...register("website")}
                      placeholder="https://yourwebsite.com"
                    />
                    {errors.website && (
                      <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
                    )}
                  </div>
                </div>

                {/* Application Questions */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Application Questions</h3>
                  <div>
                    <Label htmlFor="project_idea">
                      What's your project or brand idea? *
                    </Label>
                    <Textarea
                      id="project_idea"
                      {...register("project_idea")}
                      placeholder="Describe your creative project and what makes it unique..."
                      rows={4}
                    />
                    {errors.project_idea && (
                      <p className="text-sm text-red-600 mt-1">{errors.project_idea.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="target_audience">
                      Who is your target audience? *
                    </Label>
                    <Textarea
                      id="target_audience"
                      {...register("target_audience")}
                      placeholder="Describe your ideal audience and their interests..."
                      rows={3}
                    />
                    {errors.target_audience && (
                      <p className="text-sm text-red-600 mt-1">{errors.target_audience.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="why_join">
                      Why do you want to join 8origin Studios? *
                    </Label>
                    <Textarea
                      id="why_join"
                      {...register("why_join")}
                      placeholder="Tell us what you hope to achieve through our accelerator program..."
                      rows={4}
                    />
                    {errors.why_join && (
                      <p className="text-sm text-red-600 mt-1">{errors.why_join.message}</p>
                    )}
                  </div>
                </div>

                {/* File Uploads */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Supporting Materials (Optional)</h3>
                  <div>
                    <Label htmlFor="pitch_deck">Pitch Deck (PDF)</Label>
                    <div className="mt-1">
                      <Input
                        id="pitch_deck"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setPitchDeck(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="media_kit">Media Kit (PDF)</Label>
                    <div className="mt-1">
                      <Input
                        id="media_kit"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setMediaKit(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" variant="gradient" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
