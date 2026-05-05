import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS — The first reader that remembers what you know",
  description: "Every article becomes part of your knowledge map. ATLAS learns what you know, finds what you're missing, and shows you where to grow.",
  openGraph: {
    title: "ATLAS",
    description: "The first reader that remembers what you know.",
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
