"use client";

import { useState } from "react";

export default function ToolsPage() {
  const [count, setCount] = useState(0);

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 bg-gray-50 text-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-xl shadow-gray-100">
        
        <h1 className="text-3xl font-bold text-emerald-600">Digital Tasbih</h1>
        <p className="text-gray-500">Keep track of your Zikir</p>

        <div className="my-8 flex items-center justify-center">
          <span className="text-8xl font-bold text-gray-900 tabular-nums">
            {count}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setCount(count + 1)}
            className="h-20 w-full rounded-2xl bg-emerald-600 text-2xl font-bold text-white transition-all active:scale-95 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
          >
            Count
          </button>
          
          <button
            onClick={() => setCount(0)}
            className="w-full rounded-2xl border border-gray-200 py-3 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          >
            Reset
          </button>
        </div>
        
      </div>
    </main>
  );
}