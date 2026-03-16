"use client";

import { useEffect, useState } from "react";

type Ayah = {
  text: string;
  surah: {
    englishName: string;
    number: number;
  };
  numberInSurah: number;
};

export default function QuranVerse() {
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch a random verse (1 to 6236)
    const randomId = Math.floor(Math.random() * 6236) + 1;
    fetch(`https://api.alquran.cloud/v1/ayah/${randomId}/ms.basmeih`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setAyah(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch verse", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl animate-pulse space-y-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-gray-900/60 p-8 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
        <div className="h-4 w-3/4 rounded bg-black/10 dark:bg-white/10"></div>
        <div className="h-4 w-1/2 rounded bg-black/10 dark:bg-white/10"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-gray-900/60 p-8 text-center backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Gagal memuatkan ayat Quran. Sila semak sambungan internet anda.
        </p>
      </div>
    );
  }

  if (!ayah) return null;

  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-gray-900/60 backdrop-blur-2xl p-8 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
      <blockquote className="relative mb-6 text-xl italic leading-relaxed text-gray-800 dark:text-gray-100 md:text-2xl">
        "{ayah.text}"
      </blockquote>
      
      <cite className="block text-sm font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400 not-italic opacity-80">
        Surah {ayah.surah.englishName} • Ayat {ayah.numberInSurah}
      </cite>
    </div>
  );
}