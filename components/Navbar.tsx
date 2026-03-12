"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600">
              NOTA NGAJI
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/notes" className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium">Notes</Link>
              <Link href="/schedule" className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium">Schedule</Link>
              <Link href="/vocab" className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium">Vocab</Link>
            </div>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <span className="text-2xl">{isOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-2 pt-2 pb-3 space-y-1">
          <Link href="/notes" className="block text-gray-600 px-3 py-2 rounded-md font-medium">Notes</Link>
          <Link href="/schedule" className="block text-gray-600 px-3 py-2 rounded-md font-medium">Schedule</Link>
          <Link href="/vocab" className="block text-gray-600 px-3 py-2 rounded-md font-medium">Vocab</Link>
        </div>
      )}
    </nav>
  );
}