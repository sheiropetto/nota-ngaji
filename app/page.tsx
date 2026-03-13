"use client";

import Link from "next/link";
import QuranVerse from "../components/QuranVerse";

export default function Home() {
  return (
    <div className="w-full flex flex-col gap-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-700 px-4">
      
      <header className="space-y-3 mt-10">
        <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 pb-2">
          Nota Ngaji
        </h1>
        
        <p className="text-md text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[280px] mx-auto">
          Catat ilmu, amalkan hidup. <br />
          <span className="text-gray-400 dark:text-gray-500 font-normal">Teman pengajian agama anda.</span>
        </p>
      </header>

      <div className="w-full max-w-sm mx-auto">
        <QuranVerse />
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto mb-10">
        <Link href="/notes" className="w-full">
          <button className="w-full py-4 rounded-full bg-gradient-to-r from-[#00C9A7] to-[#059669] text-white font-bold shadow-xl shadow-[#00C9A7]/20 active:scale-95 transition-all">
            Nota
          </button>
        </Link>
        <Link href="/tools" className="w-full">
          <button className="w-full py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold shadow-sm active:bg-gray-50 dark:active:bg-gray-700 active:scale-95 transition-all">
            Zikir
          </button>
        </Link>
      </div>
    </div>
  );
}