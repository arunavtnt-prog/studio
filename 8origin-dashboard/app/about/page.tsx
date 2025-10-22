import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Sparkles, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About 8origin Studios</h1>
          <p className="text-xl text-gray-600">
            Empowering New-Gen Creator Brands
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 leading-relaxed">
            8origin Studios is a creator accelerator program based in New York City, dedicated to
            helping digital creators build sustainable businesses and brands. We believe that the
            future of media and entertainment is being shaped by independent creators, and we're
            here to provide the tools, resources, and guidance needed to succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To empower creators with the knowledge, resources, and network they need to
                transform their creative passion into thriving, sustainable businesses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
              <p className="text-gray-600">
                A world where talented creators can build profitable brands without compromising
                their creative vision or authenticity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community First</h3>
              <p className="text-gray-600">
                We foster a collaborative environment where creators support and learn from each
                other, building lasting relationships and partnerships.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
              <p className="text-gray-600">
                Our alumni have collectively generated over $2M in revenue and reached 50M+ people
                across platforms.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>One-on-one mentorship with successful creators and business experts</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Access to exclusive tools, templates, and growth strategies</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Connections to brands, platforms, and fellow creators</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>Regular workshops on content, business, and monetization</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <span>A supportive community of like-minded creators</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
