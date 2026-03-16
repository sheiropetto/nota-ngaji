import QuranVerse from "../components/QuranVerse";

export default function HomePage() {
  return (
    <main className="min-h-screen p-4 pb-24 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center space-y-8">
      <div className="w-full max-w-md mx-auto space-y-8 mt-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C9A7] to-[#059669]">
            Selamat Datang
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Teruskan kembara ilmu anda hari ini.
          </p>
        </div>
        
        <div className="flex justify-center w-full">
          <QuranVerse />
        </div>
      </div>
    </main>
  );
}