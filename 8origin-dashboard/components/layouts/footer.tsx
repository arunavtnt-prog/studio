import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">8O</span>
              </div>
              <span className="font-bold text-lg">8origin Studios</span>
            </div>
            <p className="text-sm text-gray-400">
              Empowering New-Gen Creator Brands
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/work" className="hover:text-white transition">
                  Our Work
                </Link>
              </li>
              <li>
                <Link
                  href="/partnerships"
                  className="hover:text-white transition"
                >
                  Partnerships
                </Link>
              </li>
              <li>
                <Link href="/pitch" className="hover:text-white transition">
                  Pitch Deck
                </Link>
              </li>
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h3 className="font-semibold mb-4">For Creators</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>New York, NY</li>
              <li>
                <a
                  href="mailto:team@8origin.com"
                  className="hover:text-white transition"
                >
                  team@8origin.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 8origin Studios. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
