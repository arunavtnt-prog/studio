import { Card, CardContent } from "@/components/ui/card";
import { Handshake, Building2, Megaphone, Users } from "lucide-react";

export default function PartnershipsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Partnerships</h1>
          <p className="text-xl text-gray-600">
            Building bridges between creators and industry leaders
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 leading-relaxed">
            At 8origin Studios, we've cultivated strong relationships with leading brands,
            platforms, and service providers to give our creators exclusive opportunities and
            resources. Our partnership network helps creators access better deals, premium tools,
            and collaborative opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Brand Partnerships</h3>
              <p className="text-gray-600">
                Connect with brands looking to collaborate with authentic creators. We facilitate
                partnerships that align with your values and audience.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Platform Access</h3>
              <p className="text-gray-600">
                Get early access to new platform features, beta programs, and exclusive creator
                support from major social platforms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Handshake className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Service Providers</h3>
              <p className="text-gray-600">
                Access discounted rates on essential services like video editing, graphic design,
                legal support, and accounting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Creator Collaborations</h3>
              <p className="text-gray-600">
                Network with fellow creators for collaborations, cross-promotions, and joint
                ventures that expand your reach.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interested in Partnering?</h2>
          <p className="text-gray-700 mb-6">
            If you're a brand or service provider interested in working with our creator community,
            we'd love to hear from you.
          </p>
          <a
            href="mailto:partnerships@8origin.com"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
