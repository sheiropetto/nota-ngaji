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
    fetch(`https://api.alquran.cloud/v1/ayah/${randomId}/en.asad`)
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
    <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-white p-8 text-center shadow-sm">
      <blockquote className="relative mb-6 font-serif text-xl italic leading-relaxed text-emerald-950 md:text-2xl">
        "{ayah.text}"
      </blockquote>
      
      <cite className="block text-sm font-medium uppercase tracking-widest text-emerald-600 not-italic">
        Surah {ayah.surah.englishName} • Verse {ayah.numberInSurah}
      </cite>
    </div>
  );
}