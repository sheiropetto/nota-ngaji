import Link from "next/link";
import QuranVerse from "@/components/QuranVerse";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-6 text-gray-900">
      
      <div className="w-full flex flex-col gap-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        <header className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            Nota Ngaji.
          </h1>
          
          <p className="text-md text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
            Catat ilmu, amalkan hidup. <br />
            <span className="text-gray-400 font-normal">Teman pengajian agama anda.</span>
          </p>
        </header>

        {/* Quran Verse Section - This will now contrast beautifully with the gray-50 background */}
        <div className="w-full">
          <QuranVerse />
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto">
          <Link href="/notes" className="w-full">
            <button className="w-full py-4 rounded-full bg-gradient-to-r from-[#00C9A7] to-[#059669] text-white font-bold shadow-xl shadow-[#00C9A7]/20 active:scale-95 transition-all">
              Nota
            </button>
          </Link>
          <Link href="/tools" className="w-full">
            <button className="w-full py-4 rounded-full border border-gray-200 bg-white text-gray-600 font-bold shadow-sm active:bg-gray-50 active:scale-95 transition-all">
              Zikir
            </button>
          </Link>
        </div>

        {/* Subtle decorative element for that modern "App" feel */}
        <div className="pt-4 opacity-20 pointer-events-none">
          <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto" />
        </div>

      </div>
    </main>
  );
}