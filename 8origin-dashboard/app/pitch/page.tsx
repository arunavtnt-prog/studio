import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PitchPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Pitch</h1>
          <p className="text-xl text-gray-600">
            Why 8origin Studios is the future of creator acceleration
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Opportunity</h2>
              <p className="text-gray-700 mb-4">
                The creator economy is exploding, with millions of creators worldwide building
                businesses on social platforms. However, most creators lack the business
                knowledge, resources, and network to scale sustainably.
              </p>
              <p className="text-gray-700">
                8origin Studios bridges this gap by providing structured support, expert
                mentorship, and strategic resources to help creators transform their passion into
                profitable, sustainable businesses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Approach</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Selective Curation</h3>
                    <p className="text-gray-600">
                      We carefully select creators who demonstrate creativity, work ethic, and
                      growth potential.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Personalized Support</h3>
                    <p className="text-gray-600">
                      Each creator receives tailored guidance based on their unique goals and
                      challenges.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Community & Network</h3>
                    <p className="text-gray-600">
                      Connect with fellow creators and industry professionals to expand
                      opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Impact</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
                  <p className="text-gray-600">Creators Supported</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">$2M+</div>
                  <p className="text-gray-600">Revenue Generated</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">50M+</div>
                  <p className="text-gray-600">Total Reach</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-lg mb-6 text-purple-100">
            Applications are open for our next cohort of creators
          </p>
          <Link href="/login">
            <Button
              size="xl"
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Apply to 8origin Studios
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
