"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      name: "Notes",
      path: "/notes",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
    },
    {
      name: "Vocab",
      path: "/vocab",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      name: "Tools",
      path: "/tools",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      ),
    },
    {
      name: "Jadual",
      path: "/schedule",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* 1. Header is now absolutely positioned so it doesn't push the screen down */}
      <div className="absolute top-0 left-0 w-full h-14 flex items-center justify-center px-4 bg-white/50 backdrop-blur-md z-40 border-b border-gray-100">
        <Link href="/" className="text-lg font-bold text-gray-900 tracking-tighter">
          Nota<span className="text-emerald-600">Ngaji</span>
        </Link>
      </div>

      {/* 2. Floating Pill Wrapper */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md">
        <nav className="relative overflow-hidden rounded-[28px] border border-white/40 bg-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          <div className="flex justify-around items-center h-20 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex flex-col items-center justify-center flex-1 py-2"
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 ${
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-600 shadow-[inset_0_0_12px_rgba(16,185,129,0.1)]" 
                        : "text-gray-400 active:scale-90"
                    }`}
                  >
                    <div className={`w-6 h-6 transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                      {item.icon}
                    </div>
                  </div>
                  <span 
                    className={`text-[10px] font-bold mt-1 transition-all ${
                      isActive ? "text-emerald-600 opacity-100" : "text-gray-400 opacity-0 h-0"
                    }`}
                  >
                    {item.name}
                  </span>
                  
                  {isActive && (
                    <div className="absolute bottom-1 w-1 h-1 bg-emerald-600 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}