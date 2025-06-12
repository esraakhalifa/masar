"use client"

import { Search, Menu, ShoppingCart } from "lucide-react"

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">
              M<span className="text-red-500">.</span>ASAR
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-900 hover:text-red-500 px-3 py-2 text-sm font-medium">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium">
              About us
            </a>
            <a href="#" className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium">
              Contact us
            </a>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 