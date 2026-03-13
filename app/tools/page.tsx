"use client";

import { useState, useEffect } from "react";

type ZikirOption = {
  id: string;
  label: string;
  arabic: string;
  target: number;
  weeklyTarget: number;
  color: string;
  ringColor: string;
};

const ZIKIR_OPTIONS: ZikirOption[] = [
  { id: 'subhanallah', label: 'Subhanallah', arabic: 'سُبْحَانَ ٱللَّٰهِ', target: 33, weeklyTarget: 1000, color: 'from-emerald-400 to-emerald-600', ringColor: 'text-emerald-500' },
  { id: 'alhamdulillah', label: 'Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', target: 33, weeklyTarget: 1000, color: 'from-teal-400 to-teal-600', ringColor: 'text-teal-500' },
  { id: 'allahuakbar', label: 'Allahuakbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', target: 33, weeklyTarget: 1000, color: 'from-cyan-400 to-cyan-600', ringColor: 'text-cyan-500' },
  { id: 'lailahaillallah', label: 'Lailahaillallah', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', target: 100, weeklyTarget: 500, color: 'from-blue-400 to-blue-600', ringColor: 'text-blue-500' },
  { id: 'astaghfirullah', label: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', target: 100, weeklyTarget: 500, color: 'from-indigo-400 to-indigo-600', ringColor: 'text-indigo-500' },
  { id: 'salawat', label: 'Salawat', arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', target: 100, weeklyTarget: 500, color: 'from-violet-400 to-violet-600', ringColor: 'text-violet-500' },
];

// Helper to get ISO Week ID (e.g., "2023-W42")
const getWeekId = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
};

export default function ZikirPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [weeklyCounts, setWeeklyCounts] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string>(ZIKIR_OPTIONS[0].id);
  const [isMounted, setIsMounted] = useState(false);
  const [resetConfirmationId, setResetConfirmationId] = useState<string | null>(null);
  const [weekId, setWeekId] = useState<string>("");

  // Load from local storage
  useEffect(() => {
    setIsMounted(true);
    
    // Load Lifetime Counts
    const saved = localStorage.getItem("zikir_counts");
    if (saved) {
      setCounts(JSON.parse(saved));
    }

    // Load Weekly Counts with Smart Reset
    const currentWeekId = getWeekId();
    setWeekId(currentWeekId);
    const savedWeekly = localStorage.getItem("zikir_weekly_counts");
    const savedWeekId = localStorage.getItem("zikir_week_id");

    if (savedWeekly && savedWeekId === currentWeekId) {
      setWeeklyCounts(JSON.parse(savedWeekly));
    } else {
      // New week detected (or first run), start fresh for weekly
      setWeeklyCounts({});
      localStorage.setItem("zikir_week_id", currentWeekId);
    }
  }, []);

  // Save to local storage whenever counts change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("zikir_counts", JSON.stringify(counts));
      localStorage.setItem("zikir_weekly_counts", JSON.stringify(weeklyCounts));
      if (weekId) localStorage.setItem("zikir_week_id", weekId);
    }
  }, [counts, weeklyCounts, weekId, isMounted]);

  const activeZikir = ZIKIR_OPTIONS.find((z) => z.id === activeId) || ZIKIR_OPTIONS[0];
  const currentTotal = counts[activeId] || 0;
  
  // Calculate progress for current "lap" (e.g. 0-33)
  const target = activeZikir.target;
  const progress = (currentTotal % target) / target * 100;
  const lapCount = currentTotal % target;

  const LIFETIME_TARGET = 10000;
  const grandTotal = Object.values(counts).reduce((a, b) => a + b, 0);
  const weeklyGrandTotal = Object.values(weeklyCounts).reduce((a, b) => a + b, 0);
  const grandProgress = Math.min((grandTotal / LIFETIME_TARGET) * 100, 100);

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

    // Smart week check during usage (e.g. if midnight passes)
    const currentWeekId = getWeekId();
    if (currentWeekId !== weekId) {
      setWeekId(currentWeekId);
      setWeeklyCounts({ [activeId]: 1 }); // Reset others, start this one
    } else {
      setWeeklyCounts((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] || 0) + 1,
      }));
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
      setWeeklyCounts((prev) => ({ ...prev, [resetConfirmationId]: 0 }));
      setResetConfirmationId(null);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-32 text-gray-900">
      <div className="mx-auto max-w-md space-y-6">
        
        <header>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C9A7] to-[#059669]">Zikir Digital</h1>
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
                      : "bg-white text-gray-400 border border-gray-100 hover:border-[#00C9A7]/50"
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
                <p className="text-sm font-medium text-[#059669] uppercase tracking-widest">
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
                    className="text-[#00C9A7] transition-all duration-300 ease-out"
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
        
        {/* 3. Stats Section (Weekly Ring & Lifetime) */}
        <div className="grid gap-4">
          
          {/* Weekly Progress Ring Chart */}
          <div className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100 flex flex-col items-center">
            <div className="mb-4 w-full flex items-center justify-between">
               <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Mingguan</h3>
               <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">Target</span>
            </div>
            
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                {ZIKIR_OPTIONS.map((zikir, index) => {
                  // Calculate dimensions for concentric rings
                  const radius = 110 - (index * 14); // Decrease radius for each inner ring
                  const circumference = 2 * Math.PI * radius;
                  const count = weeklyCounts[zikir.id] || 0;
                  // Cap progress at 100% for visual sanity, but tracking allows more
                  const percent = Math.min((count / zikir.weeklyTarget) * 100, 100); 
                  const offset = circumference - (percent / 100) * circumference;
                  
                  return (
                    <g key={zikir.id}>
                      {/* Background Ring */}
                      <circle
                        cx="120"
                        cy="120"
                        r={radius}
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Progress Ring */}
                      <circle
                        cx="120"
                        cy="120"
                        r={radius}
                        fill="none"
                        className={`${zikir.ringColor} transition-all duration-1000 ease-out`}
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </svg>
              
              {/* Center Legend */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-800">{weeklyGrandTotal}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Minggu Ini</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {ZIKIR_OPTIONS.map(z => (
                <div key={z.id} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${z.ringColor.replace('text-', 'bg-')}`} />
                  <span className={`text-[10px] font-bold ${z.ringColor}`}>{z.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lifetime Progress Bar */}
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#00C9A7]">Keseluruhan</p>
                <p className="text-2xl font-black">{grandTotal.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-[#00C9A7]">Sasaran</p>
                <p className="text-sm font-bold">{LIFETIME_TARGET.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#00C9A7] to-[#059669] transition-all duration-1000"
                style={{ width: `${grandProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Dashboard / Summary Grid */}
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
                  activeId === zikir.id ? 'bg-[#00C9A7]/5 border-[#00C9A7]/20' : 'bg-white border-gray-100'
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