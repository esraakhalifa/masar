'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { Menu, X, Upload, CreditCard, Phone, Home, Info, User, LogIn, LucideIcon } from 'lucide-react';

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

  const navigation: NavigationItem[] = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'Upload CV', href: '/upload', icon: Upload },
    { name: 'Payment', href: '/payment', icon: CreditCard },
    { name: 'Login', href: '/login', icon: LogIn },
    { name: 'Register', href: '/register', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-2 border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Masar</span>
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
                    className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors duration-200"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-purple-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-purple-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Envision Your Career Journey!</h1>
          <p className="text-purple-100 text-lg">AI-powered career roadmaps tailored to your skills and goals</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold">Masar</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering professionals with AI-driven career insights and personalized learning roadmaps.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link href="/upload" className="text-gray-400 hover:text-white transition-colors">CV Analysis</Link></li>
                <li><Link href="/roadmap" className="text-gray-400 hover:text-white transition-colors">Career Roadmap</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 Masar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;