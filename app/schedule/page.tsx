"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type ScheduleItem = {
  id: number;
  time: string;
  title: string;
  ustaz: string;
  location: string;
  type: "Maghrib" | "Subuh" | "Dhuha" | "Isyak";
  day: string;
};

const DAYS = ["Hari Ini", "Esok", "Lusa"];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Record<string, ScheduleItem[]>>({
    "Hari Ini": [],
    "Esok": [],
    "Lusa": [],
  });
  const [selectedDay, setSelectedDay] = useState("Hari Ini");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [ustaz, setUstaz] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<ScheduleItem["type"]>("Maghrib");
  const [day, setDay] = useState("Hari Ini");

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data } = await supabase.from("schedules").select("*");

      if (data) {
        const newSchedule: Record<string, ScheduleItem[]> = {
          "Hari Ini": [],
          "Esok": [],
          "Lusa": [],
        };

        data.forEach((item: ScheduleItem) => {
          if (newSchedule[item.day]) {
            newSchedule[item.day].push(item);
          }
        });

        Object.keys(newSchedule).forEach((key) => {
          newSchedule[key].sort((a, b) => a.time.localeCompare(b.time));
        });

        setSchedule(newSchedule);
      }
    };

    fetchSchedules();
  }, []);

  const handleAddSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !time || !ustaz || !location) return;

    const { data } = await supabase
      .from("schedules")
      .insert([
        {
          title,
          time,
          ustaz,
          location,
          type,
          day,
        },
      ])
      .select();

    if (data) {
      const newItem = data[0] as ScheduleItem;
      setSchedule((prevSchedule) => {
        const daySchedule = [...(prevSchedule[newItem.day] || []), newItem];
        daySchedule.sort((a, b) => a.time.localeCompare(b.time));
        return {
          ...prevSchedule,
          [newItem.day]: daySchedule,
        };
      });

      // Reset form and close modal
      setIsModalOpen(false);
      setTitle("");
      setTime("");
      setUstaz("");
      setLocation("");
      setType("Maghrib");
      setDay("Hari Ini");
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-neutral-950 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-8">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-500">Jadual Kuliyah</h1>
            <p className="text-neutral-400">Semak jadual pengajian agama di sekitar anda.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-emerald-600 px-6 py-2 font-bold text-white transition-all hover:bg-emerald-500 hover:scale-105"
          >
            + Add Jadual
          </button>
        </header>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((day) => (
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
          
          {schedule[selectedDay].length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center text-neutral-500">
              Tiada kelas dijadualkan.
            </div>
          ) : (
            schedule[selectedDay].map((item) => (
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

      {/* Add Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-white">Tambah Jadual Baru</h2>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <input
                type="text"
                placeholder="Tajuk Kuliyah"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  placeholder="Masa"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none"
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ScheduleItem["type"])}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option>Maghrib</option>
                  <option>Isyak</option>
                  <option>Subuh</option>
                  <option>Dhuha</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Penceramah (e.g. Ustaz Azhar Idrus)"
                value={ustaz}
                onChange={(e) => setUstaz(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Lokasi (e.g. Masjid Negeri)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none"
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-400">
                  Hari
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white focus:border-emerald-500 focus:outline-none"
                >
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-neutral-700 px-6 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-500"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
