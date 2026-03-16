"use client";

import { useTheme } from "../../components/ThemeProvider";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen p-4 pb-24 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-2xl space-y-8">
        
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C9A7] to-[#059669]">
            Tetapan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Urus keutamaan aplikasi anda.
          </p>
        </header>

        {/* Settings List */}
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-6 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-6">
          
          {/* Night Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Mod Gelap</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Tukar paparan kepada tema gelap untuk keselesaan mata.
              </p>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00C9A7] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                theme === "dark" ? "bg-[#059669]" : "bg-gray-200 dark:bg-gray-700"
              }`}
              aria-label="Tukar Mod Gelap"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  theme === "dark" ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
