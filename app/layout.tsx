import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
        <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl flex flex-col">
          <Navbar />
          
          {/* pt-14: This adds 56px of padding at the top to match the h-14 header.
            This ensures your page titles (like "Nota Ngaji.") start below the header.
          */}
          <main className="flex-1 pt-14 pb-32 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}