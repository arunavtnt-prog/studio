import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, TrendingUp, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Now Accepting Applications</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-gray-900">Empowering</span>
              <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                New-Gen Creator Brands
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
              Join the 8origin Studios accelerator program. Get expert guidance,
              resources, and connections to transform your creative passion into a
              thriving business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button size="xl" variant="gradient" className="group">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="xl" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">100+</div>
                <div className="text-sm text-gray-600">Creators Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">$2M+</div>
                <div className="text-sm text-gray-600">Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50M+</div>
                <div className="text-sm text-gray-600">Total Reach</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to build, launch, and scale your creator brand
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Mentorship</h3>
              <p className="text-gray-600">
                Work directly with successful creators and business experts who
                understand your journey.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Growth Resources</h3>
              <p className="text-gray-600">
                Access tools, templates, and strategies to accelerate your
                growth and maximize revenue.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Strategic Partnerships</h3>
              <p className="text-gray-600">
                Connect with brands, platforms, and fellow creators to unlock new
                opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Build Your Creator Brand?
          </h2>
          <p className="text-lg mb-8 text-purple-100">
            Join NYC-based creators who are turning their passion into profitable
            businesses. Applications are open now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="xl"
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Start Your Application
              </Button>
            </Link>
            <Link href="/work">
              <Button size="xl" variant="outline" className="text-white border-white hover:bg-white/10">
                See Our Work
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
