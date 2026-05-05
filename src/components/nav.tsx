"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/feed", label: "Feed", icon: "◉" },
  { href: "/explore", label: "Explore", icon: "✦" },
  { href: "/atlas", label: "Atlas", icon: "◎" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto bg-slate-900/90 backdrop-blur-lg border-t md:border-b md:border-t-0 border-slate-800 z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-around md:justify-between px-6 py-3">
        <Link href="/feed" className="hidden md:block text-lg font-black tracking-tight">
          AT<span className="text-sky-400">LAS</span>
        </Link>
        <div className="flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                pathname === item.href
                  ? "text-sky-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
