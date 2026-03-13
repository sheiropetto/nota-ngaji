import type { Metadata, Viewport } from "next"; // Added Viewport type
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// 1. Separate Viewport Export (This fixes the warning)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 2. Main Metadata Export
export const metadata: Metadata = {
  title: "Nota Ngaji",
  description: "Digital notes for your religious classes",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} antialiased bg-gray-200 text-gray-900 flex justify-center min-h-screen`}
      >
        {/* Main Mobile Container */}
        <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl flex flex-col">
          <Navbar />
          
          {/* Main content area with bottom padding for the glass navbar */}
          <main className="flex-1 pb-32">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}