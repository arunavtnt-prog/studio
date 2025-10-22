"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">8O</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">
              8origin Studios
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              About Us
            </Link>
            <Link
              href="/work"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Our Work
            </Link>
            <Link
              href="/partnerships"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Partnerships
            </Link>

            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                {session.user?.isAdmin && (
                  <Link href="/admin">
                    <Button variant="secondary">Admin</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/login">
                  <Button variant="gradient">Apply Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link
              href="/about"
              className="block text-gray-700 hover:text-gray-900"
            >
              About Us
            </Link>
            <Link
              href="/work"
              className="block text-gray-700 hover:text-gray-900"
            >
              Our Work
            </Link>
            <Link
              href="/partnerships"
              className="block text-gray-700 hover:text-gray-900"
            >
              Partnerships
            </Link>

            {session ? (
              <>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                {session.user?.isAdmin && (
                  <Link href="/admin" className="block">
                    <Button variant="secondary" className="w-full">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button variant="gradient" className="w-full">
                    Apply Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
