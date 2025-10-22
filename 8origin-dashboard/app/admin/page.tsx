"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Application } from "@/types";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !session?.user?.isAdmin)) {
      router.push("/");
    } else if (status === "authenticated" && session?.user?.isAdmin) {
      fetchApplications();
    }
  }, [status, session, router]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications?admin=true");
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes }),
      });
      if (res.ok) {
        await fetchApplications();
        setSelectedApp(null);
        setNotes("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const stats = {
    total: applications.length,
    underReview: applications.filter((a) => a.status === "under_review").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.underReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Accepted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedApp(app);
                    setNotes(app.admin_notes || "");
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{app.creator_name}</h3>
                      <p className="text-sm text-gray-600">
                        {app.profile?.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === "accepted"
                          ? "success"
                          : app.status === "rejected"
                          ? "destructive"
                          : app.status === "under_review"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {app.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {app.project_idea}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {app.youtube_handle && <span>YT: {app.youtube_followers?.toLocaleString()}</span>}
                    {app.tiktok_handle && <span>TT: {app.tiktok_followers?.toLocaleString()}</span>}
                    {app.instagram_handle && <span>IG: {app.instagram_followers?.toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{selectedApp.creator_name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedApp(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Project Idea</h4>
                  <p className="text-sm text-gray-700">{selectedApp.project_idea}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Target Audience</h4>
                  <p className="text-sm text-gray-700">{selectedApp.target_audience}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Why Join</h4>
                  <p className="text-sm text-gray-700">{selectedApp.why_join}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Admin Notes</h4>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => updateStatus(selectedApp.id, "accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => updateStatus(selectedApp.id, "rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedApp.id, "under_review")}
                  >
                    Mark as Under Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
