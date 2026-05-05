"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/feed", label: "Feed", icon: "◉", activeColor: "text-[#D4756A]" },
  { href: "/explore", label: "Explore", icon: "✦", activeColor: "text-[#6B8DB5]" },
  { href: "/atlas", label: "Map", icon: "◎", activeColor: "text-[#7CB5A0]" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto bg-[#FAF8F3]/90 backdrop-blur-lg border-t md:border-b md:border-t-0 border-[#E8E4DD] z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-around md:justify-between px-6 py-3">
        <Link href="/feed" className="hidden md:block text-lg font-black tracking-tight text-[#2D3142]">
          mar<span className="text-[#D4756A]">gin</span>
        </Link>
        <div className="flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                pathname === item.href
                  ? item.activeColor
                  : "text-[#6B7280] hover:text-[#2D3142]"
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
