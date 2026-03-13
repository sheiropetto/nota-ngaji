"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type ScheduleItem = {
  id: number;
  day: string;
  period: string;
  time: string;
  activity: string;
  location: string;
};

const DAYS = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
const PERIODS = ["Dhuha", "Zohor", "Maghrib", "Isyak", "Lain-lain"];

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [day, setDay] = useState(DAYS[0]);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [time, setTime] = useState("");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .order('id', { ascending: true }); // Ideally order by time, but simplfied here
    
    if (data) setItems(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim() || !time.trim()) {
      showToast("Sila isi masa dan aktiviti.");
      return;
    }

    const entry = { day, period, time, activity, location };

    if (editingId) {
      const { error } = await supabase.from('schedule').update(entry).eq('id', editingId);
      if (!error) {
        setItems(items.map(item => item.id === editingId ? { ...item, ...entry } : item));
        showToast("Jadual dikemaskini.");
        closeForm();
      } else {
        showToast("Ralat: " + error.message);
      }
    } else {
      const { data, error } = await supabase.from('schedule').insert([entry]).select();
      if (data) {
        setItems([...items, data[0]]);
        showToast("Kelas ditambah.");
        closeForm();
      } else if (error) {
        showToast("Ralat: " + error.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('schedule').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(item => item.id !== id));
      showToast("Kelas dipadam.");
    }
    setDeleteConfirmationId(null);
  };

  const handleEdit = (item: ScheduleItem) => {
    setDay(item.day);
    setPeriod(item.period || PERIODS[0]);
    setTime(item.time);
    setActivity(item.activity);
    setLocation(item.location);
    setEditingId(item.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setActivity("");
    setTime("");
    setLocation("");
    setDay(DAYS[0]);
    setPeriod(PERIODS[0]);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-600">Jadual Kuliah</h1>
            <p className="text-gray-500 text-sm">Urus masa, tuntut ilmu.</p>
          </div>
          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              <span>Tambah Jadual</span>
            </button>
          )}
        </header>

        {/* Form */}
        {isFormOpen && (
          <form onSubmit={handleSave} className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{editingId ? "Kemaskini Kelas" : "Tambah Kelas Baru"}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-wider">Hari</label>
                <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none">
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-wider">Masa</label>
                <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Contoh: 8.00 PM" className="w-full rounded-2xl border-none bg-gray-50 p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-wider">Waktu</label>
              <div className="flex flex-wrap gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      period === p
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                        : "bg-white border-gray-200 text-gray-400 hover:border-emerald-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-wider">Aktiviti / Kitab</label>
              <input type="text" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Nama kuliah atau kitab..." className="w-full rounded-2xl border-none bg-gray-50 p-3 font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi / Guru (Pilihan)</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Masjid atau nama ustaz..." className="w-full rounded-2xl border-none bg-gray-50 p-3 font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                className="flex-1 bg-emerald-600 text-white py-3 rounded-full font-bold active:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
              <button type="button" onClick={closeForm} className="px-6 py-3 text-gray-500 font-medium active:text-gray-900 rounded-full bg-gray-100">Batal</button>
            </div>
          </form>
        )}

        {/* Schedule List */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center text-gray-400 py-12 italic">Memuatkan jadual...</div>
          ) : items.length === 0 && !isFormOpen ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
              Tiada jadual kuliah.
            </div>
          ) : (
            DAYS.map((d) => {
              const dayItems = items.filter(i => i.day === d);
              if (dayItems.length === 0) return null;
              
              return (
                <div key={d} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-gray-800">{d}</h3>
                    <div className="h-px flex-1 bg-gray-200"></div>
                  </div>
                  
                  <div className="grid gap-3">
                    {dayItems.map((item) => (
                      <div key={item.id} className="group relative flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex-shrink-0 w-16 pt-1">
                          <span className="text-sm font-bold text-emerald-600 block">{item.time}</span>
                          {item.period && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">{item.period}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 leading-snug">{item.activity}</h4>
                          {item.location && (
                            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.45-.96 2.337-1.782C15.485 14.908 17 12.331 17 9.5 17 5.358 13.866 2 10 2 6.134 2 3 5.358 3 9.5c0 2.83 1.515 5.408 3.291 7.07.887.822 1.717 1.398 2.337 1.782.31.193.57.337.757.433.093.048.17.087.232.117l.049.024.006.003zM10 12.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                              {item.location}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleEdit(item)} className="p-2 text-gray-300 hover:text-emerald-600 rounded-full hover:bg-emerald-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
                           </button>
                           <button onClick={() => setDeleteConfirmationId(item.id)} className="p-2 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold">Padam Kelas?</h3>
            <p className="text-gray-500 text-sm">Tindakan ini akan membuang kelas ini dari jadual.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-4 font-bold text-gray-500 rounded-full">Batal</button>
              <button onClick={() => handleDelete(deleteConfirmationId)} className="flex-1 rounded-full bg-red-500 py-4 font-bold text-white shadow-lg shadow-red-100">Padam</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm animate-in fade-in slide-in-from-bottom-2 z-50">
          {toastMessage}
        </div>
      )}
    </main>
  );
}