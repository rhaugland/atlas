import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS — Know More, Know Deeper",
  description: "A knowledge-aware reader that learns what you know and guides your growth.",
  openGraph: {
    title: "ATLAS",
    description: "Know more. Know deeper. Know what you're missing.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
