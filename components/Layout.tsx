"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Upload,
  CreditCard,
  Phone,
  Home,
  Info,
  User,
  LogIn,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import routeIcon from "../public/route.svg";
interface LayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  console.log("Session:", session, "Status:", status);

  const navigation: NavigationItem[] = [
    // { name: 'Home', href: '/', icon: Home },
    // { name: 'Upload CV', href: '/upload', icon: Upload },
    // { name: 'Build Profile', href: '/build-profile', icon: ClipboardList },
    // { name: 'Payment', href: '/payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span
                  className="text-xl font-bold text-transparent bg-clip-text"
                  style={{
                    background: "linear-gradient(to right, #2434B3, #FF4B36)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  <Image
                    src={routeIcon}
                    alt="routeIcon"
                    className="w-5 h-5 inline-block "
                  />
                  Masar
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-bold"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {!session ? (
                <div className="relative">
                  <details className="dropdown">
                    <summary className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-bold cursor-pointer">
                      <ChevronDown className="w-4 h-4" />

                      <User className="w-4 h-4" />
                    </summary>
                    <ul className="dropdown-content bg-white shadow-lg border rounded-lg mt-2 p-2 w-40 absolute right-0 z-10">
                      <li>
                        <Link
                          href="/login"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Login</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/register"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                        >
                          <User className="w-4 h-4" />
                          <span>Register</span>
                        </Link>
                      </li>
                    </ul>
                  </details>
                </div>
              ) : (
                <div className="relative">
                  <details className="dropdown">
                    <summary className="flex items-center space-x-2 cursor-pointer">
                      <ChevronDown className="w-4 h-4" />
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{
                          background:
                            "linear-gradient(to right, #2434B3, #FF4B36)",
                        }}
                      >
                        {session.user?.email?.charAt(0).toUpperCase()}
                      </div>
                    </summary>
                    <ul className="dropdown-content bg-white shadow-lg border rounded-lg mt-2 p-2 w-48 absolute right-0 z-10">
                      <li className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100">
                        {session.user?.name}
                      </li>
                      <li>
                        <Link
                          href="/"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                        >
                          <Home className="w-4 h-4" />
                          <span>Home</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/upload"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload CV</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/payment"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Payment</span>
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold w-full text-left"
                        >
                          <LogIn className="w-4 h-4 rotate-180" />
                          <span>Sign Out</span>
                        </button>
                      </li>
                    </ul>
                  </details>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {!session ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100">
                    {session.user?.email}
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/upload"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload CV</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/payment"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Payment</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-bold w-full text-left"
                  >
                    <LogIn className="w-4 h-4 rotate-180" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className="text-white py-12 mt-16"
        style={{ background: "#2434B3" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold text-[#FF4B36]">Masar</span>
              </div>
              <p className="text-blue-100 mb-4">
                Empowering professionals with AI-driven career insights and
                personalized learning roadmaps.
              </p>
            </div>

            {session && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/"
                        className="text-blue-200 hover:text-white transition-colors font-medium"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="text-blue-200 hover:text-white transition-colors font-medium"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about"
                        className="text-blue-200 hover:text-white transition-colors font-medium"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="text-blue-200 hover:text-white transition-colors font-medium"
                      >
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/upload"
                        className="text-blue-200 hover:text-white transition-colors font-medium"
                      >
                        Upload CV
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/payment"
                        className="text-blue-200 hover:text-orange-300 transition-colors font-medium"
                      >
                        Payment
                      </Link>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {!session && (
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-4">Get Started</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/login"
                      className="text-blue-200 hover:text-white transition-colors font-medium"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-blue-200 hover:text-orange-300 transition-colors font-medium"
                    >
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-blue-200 hover:text-white transition-colors font-medium"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-blue-200 hover:text-white transition-colors font-medium"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="border-t border-blue-400 mt-8 pt-8 text-center">
            <p className="text-blue-100">
              &copy; 2025 Masar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
