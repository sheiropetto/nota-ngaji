"use client";

import React from "react";

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-emerald-900">My Study Notes</h1>
        <p className="text-gray-600 font-medium">Keep track of your learning progress and insights.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for future notes */}
        <div className="p-6 rounded-xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold text-emerald-800 mb-2">Tajweed Basics</h3>
          <p className="text-sm text-gray-500 italic">Last updated: Just now</p>
        </div>
        
        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center border-dashed">
          <button className="text-emerald-600 font-medium hover:underline">+ Add New Note</button>
        </div>
      </div>
    </div>
  );
}