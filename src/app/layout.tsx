import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "margin — your mind, picked up where you left off",
  description: "Every article becomes part of your knowledge map. margin learns what you know, finds what you're missing, and shows you where to grow.",
  openGraph: {
    title: "margin",
    description: "your mind, picked up where you left off.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FAF8F3] text-[#1A1A1A] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
