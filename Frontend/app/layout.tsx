import type { Metadata } from "next";
import { Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScanlineOverlay from "@/components/ScanlineOverlay";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SENTINEL-AXON // Tactical Cyber Command",
  description: "High-Density Tactical Cybersecurity Command & Autonomous Agent Suite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${jetBrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-screen bg-[#0a0c10] text-[#e2e2e8] flex flex-col font-sans relative overflow-x-hidden">
        <ScanlineOverlay />
        <Navbar />
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-3 md:p-4 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
