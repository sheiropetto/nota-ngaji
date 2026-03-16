"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Stage = {
  level: number;
  name: string;
  target: number;
};

const STAGES: Stage[] = [
  { level: 1, name: "Benih Niat", target: 0 },
  { level: 2, name: "Tunas Usaha", target: 500 },
  { level: 3, name: "Pohon Istiqamah", target: 2000 },
  { level: 4, name: "Rendang Ilmu", target: 10000 },
  { level: 5, name: "Taman Syurga", target: 50000 },
];

export default function SpiritualTree() {
  const [points, setPoints] = useState(0);
  const [stats, setStats] = useState({ zikir: 0, notes: 0, vocab: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      // 1. Get Zikir from Local Storage
      const savedZikir = localStorage.getItem("zikir_counts");
      let totalZikir = 0;
      if (savedZikir) {
        const counts = JSON.parse(savedZikir);
        totalZikir = Object.values(counts).reduce((a, b) => (a as number) + (b as number), 0) as number;
      }

      // 2. Get Notes count from Supabase
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true });
      
      // 3. Get Vocab count from Supabase
      const { count: vocabCount } = await supabase
        .from('vocab')
        .select('*', { count: 'exact', head: true });

      const totalNotes = notesCount || 0;
      const totalVocab = vocabCount || 0;

      setStats({ zikir: totalZikir, notes: totalNotes, vocab: totalVocab });
      
      // Smart Calculation: Weights for different activities
      // Zikir = 1 pt | Vocab = 10 pts | Note = 50 pts
      const totalPoints = totalZikir + (totalVocab * 10) + (totalNotes * 50);
      setPoints(totalPoints);
      setLoading(false);
    };

    fetchProgress();
  }, []);

  // Determine Current and Next Stage
  let currentStage = STAGES[0];
  let nextStage = STAGES[1];
  
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (points >= STAGES[i].target) {
      currentStage = STAGES[i];
      nextStage = STAGES[i + 1] || STAGES[i]; // If max stage, next stage is same
      break;
    }
  }

  // Calculate progress bar percentage
  const isMaxLevel = currentStage.level === 5;
  const pointsInCurrentStage = points - currentStage.target;
  const pointsNeededForNextStage = nextStage.target - currentStage.target;
  const progressPercent = isMaxLevel 
    ? 100 
    : Math.min(100, Math.max(0, (pointsInCurrentStage / pointsNeededForNextStage) * 100));

  if (loading) {
    return (
      <div className="w-full h-48 animate-pulse rounded-3xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-gray-900/60 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]" />
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-gray-900/60 backdrop-blur-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] flex flex-col items-center text-center">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-emerald-400 to-cyan-500" />

      <header className="relative z-10 space-y-1 mb-6 w-full flex items-center justify-between">
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Level {currentStage.level}
          </p>
          <h2 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            {currentStage.name}
          </h2>
        </div>
        
        {/* Minimalist Glass Icon */}
        <div className="w-14 h-14 flex-shrink-0 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg flex items-center justify-center relative overflow-hidden group animate-in zoom-in duration-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="url(#tree-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 drop-shadow-md">
            <defs>
              <linearGradient id="tree-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path d="M12 22v-8" />
            <path d="M12 14c-4.2 0-7-3.8-7-8 4.2 0 7 3.8 7 8z" />
            <path d="M12 14c4.2 0 7-3.8 7-8-4.2 0-7 3.8-7 8z" />
          </svg>
        </div>
      </header>

      {/* Progress Bar Section */}
      <div className="relative z-10 w-full space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
          <span>{points.toLocaleString()} pts</span>
          {!isMaxLevel && <span>{nextStage.target.toLocaleString()} pts</span>}
        </div>
        
        <div className="h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-black/30 shadow-inner">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="relative z-10 mt-6 flex w-full justify-between rounded-2xl bg-white/30 dark:bg-white/5 p-3 border border-white/40 dark:border-white/10 shadow-sm">
        <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/10">
          <span className="text-sm font-black text-gray-800 dark:text-gray-100">{stats.notes}</span>
          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Nota</span>
        </div>
        <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/10">
          <span className="text-sm font-black text-gray-800 dark:text-gray-100">{stats.vocab}</span>
          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Kosa Kata</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-sm font-black text-gray-800 dark:text-gray-100">{stats.zikir > 999 ? (stats.zikir/1000).toFixed(1) + 'k' : stats.zikir}</span>
          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Zikir</span>
        </div>
      </div>

    </div>
  );
}