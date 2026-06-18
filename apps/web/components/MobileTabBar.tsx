"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// شريط تنقّل سفلي بإحساس تطبيق أصلي — يظهر على الجوال/التابلت فقط.
const TABS = [
  { href: "/dashboard", label: "الرئيسية", icon: "🏠" },
  { href: "/values", label: "القيم", icon: "🌱" },
  { href: "/review", label: "المراجعة", icon: "✅" },
  { href: "/rewards", label: "المكافآت", icon: "🎁" },
  { href: "/reports", label: "التقارير", icon: "📊" },
];

export function MobileTabBar() {
  const pathname = usePathname() || "";
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="التنقّل"
    >
      <ul className="mx-auto flex w-full max-w-3xl items-stretch justify-around px-1.5 py-1.5">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] font-semibold transition ${
                  active ? "bg-ghars-50 text-ghars-700" : "text-slate-400 hover:text-ghars-600"
                }`}
              >
                <span className={`text-xl leading-none transition ${active ? "scale-110" : ""}`}>{t.icon}</span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
