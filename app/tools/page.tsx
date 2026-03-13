"use client";

import { useState, useEffect } from "react";

type ZikirOption = {
  id: string;
  label: string;
  arabic: string;
  target: number;
  color: string;
};

const ZIKIR_OPTIONS: ZikirOption[] = [
  { id: 'subhanallah', label: 'Subhanallah', arabic: 'سُبْحَانَ ٱللَّٰهِ', target: 33, color: 'from-emerald-400 to-emerald-600' },
  { id: 'alhamdulillah', label: 'Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', target: 33, color: 'from-teal-400 to-teal-600' },
  { id: 'allahuakbar', label: 'Allahuakbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', target: 33, color: 'from-cyan-400 to-cyan-600' },
  { id: 'lailahaillallah', label: 'Lailahaillallah', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', target: 100, color: 'from-blue-400 to-blue-600' },
  { id: 'astaghfirullah', label: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', target: 100, color: 'from-indigo-400 to-indigo-600' },
  { id: 'salawat', label: 'Salawat', arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', target: 100, color: 'from-violet-400 to-violet-600' },
];

export default function ZikirPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string>(ZIKIR_OPTIONS[0].id);
  const [isMounted, setIsMounted] = useState(false);
  const [resetConfirmationId, setResetConfirmationId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("zikir_counts");
    if (saved) {
      setCounts(JSON.parse(saved));
    }
  }, []);

  // Save to local storage whenever counts change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("zikir_counts", JSON.stringify(counts));
    }
  }, [counts, isMounted]);

  const activeZikir = ZIKIR_OPTIONS.find((z) => z.id === activeId) || ZIKIR_OPTIONS[0];
  const currentTotal = counts[activeId] || 0;
  
  // Calculate progress for current "lap" (e.g. 0-33)
  const target = activeZikir.target;
  const progress = (currentTotal % target) / target * 100;
  const lapCount = currentTotal % target;

  const handleCount = () => {
    // Haptic feedback for mobile
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      // Different vibration pattern when hitting target
      if (lapCount + 1 === target) {
        navigator.vibrate([50, 50, 50]); 
      } else {
        navigator.vibrate(10);
      }
    }

    setCounts((prev) => ({
      ...prev,
      [activeId]: (prev[activeId] || 0) + 1,
    }));
  };

  const handleReset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResetConfirmationId(id);
  };

  const confirmReset = () => {
    if (resetConfirmationId) {
      setCounts((prev) => ({ ...prev, [resetConfirmationId]: 0 }));
      setResetConfirmationId(null);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-32 text-gray-900">
      <div className="mx-auto max-w-md space-y-6">
        
        <header>
          <h1 className="text-3xl font-bold text-emerald-600">Zikir Digital</h1>
          <p className="text-gray-500 text-sm">Basahi lidah dengan mengingati Allah.</p>
        </header>

        {/* 1. Sliding Options */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 pt-2 snap-x no-scrollbar">
            {ZIKIR_OPTIONS.map((zikir) => {
              const isActive = activeId === zikir.id;
              return (
                <button
                  key={zikir.id}
                  onClick={() => setActiveId(zikir.id)}
                  className={`flex-shrink-0 snap-center rounded-2xl p-4 transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${zikir.color} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-offset-gray-50 ring-emerald-200`
                      : "bg-white text-gray-400 border border-gray-100 hover:border-emerald-200"
                  }`}
                >
                  <span className="text-sm font-bold whitespace-nowrap">{zikir.label}</span>
                </button>
              );
            })}
          </div>
          {/* Fade effect on the right to indicate scroll */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
        </div>

        {/* 2. Main Active Zikir Display & Button */}
        <div className="relative">
          <div className="bg-white rounded-[40px] shadow-xl p-8 text-center border border-gray-100 relative overflow-hidden">
            
            {/* Background Decoration */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${activeZikir.color}`} />
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2 h-32 flex flex-col justify-center">
                <h2 className="text-4xl font-bold leading-relaxed text-gray-800" dir="rtl">
                  {activeZikir.arabic}
                </h2>
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-widest">
                  {activeZikir.label}
                </p>
              </div>

              {/* Huge Smart Button */}
              <button
                onClick={handleCount}
                className="group relative w-48 h-48 mx-auto flex flex-col items-center justify-center rounded-full bg-gray-50 active:bg-gray-100 transition-all active:scale-95 touch-manipulation outline-none"
                style={{
                  boxShadow: "inset 0 4px 10px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.1)"
                }}
              >
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 - (progress / 100) * 301.59}
                    className="text-emerald-500 transition-all duration-300 ease-out"
                    strokeLinecap="round"
                  />
                </svg>

                <span className="text-6xl font-black text-gray-800 tabular-nums">
                  {lapCount}
                </span>
                <span className="text-xs font-bold text-gray-400 mt-1 uppercase">Target: {activeZikir.target}</span>
              </button>

              <div className="text-gray-400 text-xs font-medium">
                Jumlah Keseluruhan: <span className="text-gray-900 font-bold">{currentTotal}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3. Dashboard / Summary Grid */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Papan Pemuka</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-bold">Semua</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {ZIKIR_OPTIONS.map((zikir) => (
              <div 
                key={zikir.id} 
                onClick={() => setActiveId(zikir.id)}
                className={`relative p-4 rounded-3xl border transition-all cursor-pointer ${
                  activeId === zikir.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${zikir.color}`} />
                  <button 
                    onClick={(e) => handleReset(zikir.id, e)}
                    className="text-gray-300 hover:text-red-400 p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-2xl font-bold text-gray-800 tabular-nums mb-1">
                  {counts[zikir.id] || 0}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                  {zikir.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {resetConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold">Tetapkan Semula?</h3>
            <p className="text-gray-500 text-sm">Adakah anda pasti mahu menetapkan semula kiraan ini kepada kosong?</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setResetConfirmationId(null)} className="flex-1 py-4 font-bold text-gray-500 rounded-full">Batal</button>
              <button onClick={confirmReset} className="flex-1 rounded-full bg-red-500 py-4 font-bold text-white shadow-lg shadow-red-100">Ya, Tetapkan</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}