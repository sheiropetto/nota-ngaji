"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [ustaz, setUstaz] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<ScheduleItem["type"]>("Maghrib");
  const [day, setDay] = useState("Hari Ini");

  const fetchSchedules = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSaveSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !time || !ustaz || !location) {
      alert("Sila isi semua ruangan.");
      return;
    }
    setIsSubmitting(true);

    if (editingId) {
      // Update
      const { error } = await supabase
        .from("schedules")
        .update({ title, time, ustaz, location, type, day })
        .eq("id", editingId);
      if (!error) {
        fetchSchedules();
        showToast("Jadual berjaya dikemaskini.");
      }
    } else {
      // Insert
      const { error } = await supabase
        .from("schedules")
        .insert([{ title, time, ustaz, location, type, day }]);
      if (!error) {
        fetchSchedules();
        showToast("Jadual berjaya ditambah.");
      }
    }

    closeAndResetModal();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) {
      fetchSchedules();
      showToast("Jadual telah dipadam.");
    }
    setDeleteConfirmationId(null);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setTime(item.time);
    setUstaz(item.ustaz);
    setLocation(item.location);
    setType(item.type);
    setDay(item.day);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setTime("");
    setUstaz("");
    setLocation("");
    setType("Maghrib");
    setDay("Hari Ini");
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTitle("");
    setTime("");
    setUstaz("");
    setLocation("");
    setType("Maghrib");
    setDay("Hari Ini");
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  return (
    <main className="min-h-full bg-gray-50 p-4 text-gray-900">
      <div className="mx-auto w-full space-y-8">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-600">Jadual Kuliyah</h1>
            <p className="text-gray-500">Semak jadual pengajian agama di sekitar anda.</p>
          </div>
          <button
            onClick={openAddModal}
            className="rounded-full bg-emerald-600 px-6 py-2 font-bold text-white transition-all hover:bg-emerald-700 hover:scale-105 shadow-md shadow-emerald-100"
          >
            + Jadual
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
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{selectedDay}</h2>
          
          {schedule[selectedDay].length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              Tiada kelas dijadualkan.
            </div>
          ) : (
            schedule[selectedDay].map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-lg shadow-sm"
              >
                <div className="absolute top-0 right-0 rounded-bl-2xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {item.type}
                </div>
                
                <div className="mb-4">
                  <span className="text-sm text-emerald-600">{item.time}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{item.title}</h3>
                </div>
                
                <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-6">
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
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 rounded-full text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    title="Edit Jadual"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125 18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmationId(item.id)}
                    className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Padam Jadual"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{editingId ? "Kemaskini Jadual" : "Jadual Baru"}</h2>
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <input
                type="text"
                placeholder="Tajuk Kuliyah"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  placeholder="Masa"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white"
                  required
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ScheduleItem["type"])}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:bg-white"
                >
                  <option>Maghrib</option>
                  <option>Isyak</option>
                  <option>Subuh</option>
                  <option>Dhuha</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Penceramah"
                value={ustaz}
                onChange={(e) => setUstaz(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white"
                required
              />
              <input
                type="text"
                placeholder="Lokasi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:bg-white"
                required
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-500">
                  Hari
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:bg-white"
                >
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="rounded-full border border-gray-200 px-6 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-transform active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md shadow-emerald-100"
                >
                  {isSubmitting ? "Saving..." : (editingId ? "Update" : "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg text-sm">
          {toastMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">Padam Jadual?</h3>
            <p className="text-gray-500">Tindakan ini tidak boleh dikembalikan.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirmationId)} className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-medium hover:bg-red-600">
                Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
