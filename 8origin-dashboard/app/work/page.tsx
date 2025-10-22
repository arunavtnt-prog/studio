import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WorkPage() {
  const creators = [
    {
      name: "Sarah Chen",
      niche: "Tech Education",
      achievement: "Grew from 10K to 500K subscribers in 12 months",
      platform: "YouTube",
    },
    {
      name: "Marcus Williams",
      niche: "Fitness & Wellness",
      achievement: "Launched successful supplement brand, $1M revenue",
      platform: "Instagram",
    },
    {
      name: "Alex Rivera",
      niche: "Cooking & Lifestyle",
      achievement: "5M+ TikTok followers, signed with major brand deals",
      platform: "TikTok",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Work</h1>
          <p className="text-xl text-gray-600">
            Meet the creators we've helped build thriving brands
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {creators.map((creator, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{creator.name}</CardTitle>
                  <Badge variant="outline">{creator.platform}</Badge>
                </div>
                <p className="text-sm text-gray-600">{creator.niche}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{creator.achievement}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Want to be featured here?</h2>
          <p className="text-lg mb-6 text-purple-100">
            Join our accelerator program and build your creator brand with expert guidance
          </p>
          <a
            href="/login"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Apply Now
          </a>
        </div>
      </div>
    </div>
  );
}
