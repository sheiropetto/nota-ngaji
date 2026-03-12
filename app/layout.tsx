import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
});

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
        <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl flex flex-col">
          <Navbar />
          <div className="flex-1 pb-24">{children}</div>
        </div>
      </body>
    </html>
  );
}
