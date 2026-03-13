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

  useEffect(() => {
    // Fetch a random verse (1 to 6236)
    const randomId = Math.floor(Math.random() * 6236) + 1;
    fetch(`https://api.alquran.cloud/v1/ayah/${randomId}/ms.basmeih`)
      .then((res) => res.json())
      .then((data) => {
        setAyah(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch verse", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl animate-pulse space-y-3 rounded-xl border border-emerald-500/10 bg-emerald-50/50 p-6">
        <div className="h-4 w-3/4 rounded bg-emerald-200"></div>
        <div className="h-4 w-1/2 rounded bg-emerald-200"></div>
      </div>
    );
  }

  if (!ayah) return null;

  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-xl shadow-emerald-50/50">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
      <blockquote className="relative mb-6 text-xl italic leading-relaxed text-gray-800 md:text-2xl">
        "{ayah.text}"
      </blockquote>
      
      <cite className="block text-sm font-medium uppercase tracking-widest text-emerald-600 not-italic opacity-80">
        Surah {ayah.surah.englishName} • Ayat {ayah.numberInSurah}
      </cite>
    </div>
  );
}