import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyRequest() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            A sign in link has been sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-600">
          <p>Click the link in the email to sign in to your account.</p>
          <p className="mt-4">You can close this window.</p>
        </CardContent>
      </Card>
    </div>
  );
}
