"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Gatherings", icon: "🧭" },
  { href: "/trips/new", label: "Ny", icon: "✦" },
  { href: "/me", label: "Meg", icon: "☻" },
];

export function BottomNav() {
  const path = usePathname();
  if (path === "/login" || path === "/onboarding" || path === "/setup") return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-2 shadow-pop">
        {items.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-fg text-bg" : "text-muted hover:text-fg"
              }`}
            >
              <span className="text-base">{it.icon}</span>
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
