import Link from "next/link";
import QuranVerse from "@/components/QuranVerse";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-950 via-black to-black text-white">
      
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-8 text-center">
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
          Nota Ngaji.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Catat ilmu, amalkan hidup. <br />
          Your personal companion for religious studies.
        </p>

        {/* Quran Verse Section */}
        <QuranVerse />

        <div className="flex gap-4 justify-center mt-6">
          <Link href="/notes">
            <button className="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform duration-200">
              Start Writing
            </button>
          </Link>
          <Link href="/tools">
            <button className="px-8 py-3 rounded-full border border-gray-600 bg-black/50 backdrop-blur-md hover:bg-gray-800 transition-colors duration-200">
              Zikir Counter
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}