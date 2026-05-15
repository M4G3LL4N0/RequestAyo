"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const items = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-400"
          onClick={() => setOpen(false)}
        >
          Ayo
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-white sm:inline-flex sm:text-sm"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-white md:hidden"
            aria-expanded={open}
            aria-controls="ayo-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden>{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="ayo-mobile-nav"
          className="mx-auto flex max-w-7xl flex-col gap-1 border-t border-slate-800 px-4 py-3 sm:px-6 md:hidden"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <p className="px-3 pt-1 text-[11px] leading-relaxed text-slate-500">
            Decision suggestions are illustrative — confirm availability, pricing, and safety with providers before
            you act.
          </p>
        </nav>
      )}
    </header>
  );
}
