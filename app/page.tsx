import Link from "next/link";
import QuranVerse from "@/components/QuranVerse";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-white to-white text-gray-900">
      
      <div className="w-full flex flex-col gap-8 text-center">
        
        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600">
          Nota Ngaji.
        </h1>
        
        <p className="text-lg text-gray-600 mx-auto leading-relaxed">
          Catat ilmu, amalkan hidup. <br />
          Your personal companion for religious studies.
        </p>

        {/* Quran Verse Section */}
        <QuranVerse />

        <div className="flex gap-4 justify-center mt-6">
          <Link href="/notes">
            <button className="px-8 py-3 rounded-full bg-emerald-600 text-white font-bold hover:scale-105 transition-transform duration-200 shadow-lg shadow-emerald-200">
              Start Writing
            </button>
          </Link>
          <Link href="/tools">
            <button className="px-8 py-3 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200 text-gray-700">
              Zikir Counter
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}