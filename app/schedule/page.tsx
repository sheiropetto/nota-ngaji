"use client";

import { useState } from "react";

type ScheduleItem = {
  id: number;
  time: string;
  title: string;
  ustaz: string;
  location: string;
  type: "Maghrib" | "Subuh" | "Dhuha" | "Isyak";
};

const MOCK_SCHEDULE: Record<string, ScheduleItem[]> = {
  "Hari Ini": [
    {
      id: 1,
      time: "07:30 PM",
      title: "Kitab Penawar Bagi Hati",
      ustaz: "Ustaz Azhar Idrus",
      location: "Masjid Negeri",
      type: "Maghrib",
    },
    {
      id: 2,
      time: "09:00 PM",
      title: "Tafsir Al-Quran",
      ustaz: "Ustaz Don Daniyal",
      location: "Surau Al-Hidayah",
      type: "Isyak",
    },
  ],
  "Esok": [
    {
      id: 3,
      time: "06:00 AM",
      title: "Kuliyah Subuh Perdana",
      ustaz: "Ustaz Kazim Elias",
      location: "Masjid Al-Muktafi Billah Shah",
      type: "Subuh",
    },
  ],
  "Lusa": [],
};

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState("Hari Ini");

  return (
    <main className="min-h-[calc(100vh-64px)] bg-neutral-950 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-8">
        
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-emerald-500">Jadual Kuliyah</h1>
          <p className="text-neutral-400">Semak jadual pengajian agama di sekitar anda.</p>
        </header>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.keys(MOCK_SCHEDULE).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                selectedDay === day
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">{selectedDay}</h2>
          
          {MOCK_SCHEDULE[selectedDay].length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center text-neutral-500">
              Tiada kelas dijadualkan.
            </div>
          ) : (
            MOCK_SCHEDULE[selectedDay].map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-all hover:border-emerald-500/50"
              >
                <div className="absolute top-0 right-0 rounded-bl-xl bg-emerald-900/30 px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {item.type}
                </div>
                
                <div className="mb-4">
                  <span className="text-sm font-mono text-emerald-500">{item.time}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{item.title}</h3>
                </div>
                
                <div className="flex flex-col gap-2 text-sm text-neutral-400 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                    {item.ustaz}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.381 2.274 1.766.311.192.571.337.757.433.093.05.165.09.213.114l.063.025.002.001zM8 9a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                    </svg>
                    {item.location}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
