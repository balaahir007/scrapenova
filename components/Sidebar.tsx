"use client";

import {
  CoinsIcon,
  HomeIcon,
  Layers2Icon,
  MenuIcon,
  MoonIcon,
  ShieldCheckIcon,
  SunIcon,
  ZapIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const routes = [
  { href: "/",            label: "Home",        icon: HomeIcon       },
  { href: "/workflows",   label: "Workflows",   icon: Layers2Icon    },
  { href: "/credentials", label: "Credentials", icon: ShieldCheckIcon},
  { href: "/billing",     label: "Billing",     icon: CoinsIcon      },
];

/* ── Theme toggle button ─────────────────────────────────────── */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by showing placeholder until mounted
  if (!mounted) {
    return (
      <button
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all duration-200",
          "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 ring-1 ring-cyan-200"
        )}
        disabled
        aria-label="Toggle theme"
      >
        <MoonIcon size={15} />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all duration-200",
        isDark
          ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 ring-1 ring-zinc-700"
          : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 ring-1 ring-cyan-200"
      )}
      aria-label="Toggle theme"
    >
      {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
    </button>
  );
}

/* ── Brand mark ──────────────────────────────────────────────── */
function ScrapeNovaLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-500 shadow-[0_0_14px_rgba(6,182,212,0.55)]">
        <ZapIcon size={16} className="text-zinc-950" strokeWidth={2.5} />
        <span className="absolute -right-[3px] -top-[3px] h-2 w-2 rounded-full border-2 border-zinc-900 bg-cyan-400" />
      </span>
      {!collapsed && (
        <span
          className="font-bold tracking-tight dark:text-white text-zinc-900"
          style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif", fontSize: "1.15rem" }}
        >
          Scrape<span className="text-cyan-500 dark:text-cyan-400">Nexa</span>
        </span>
      )}
    </div>
  );
}

/* ── Nav link ─────────────────────────────────────────────────── */
function NavLink({
  route,
  isActive,
  onClick,
}: {
  route: (typeof routes)[0];
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = route.icon;
  return (
    <Link
      href={route.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.3)]"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-cyan-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      {/* Active left bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
      )}

      <Icon
        size={17}
        className={cn(
          "shrink-0 transition-colors",
          isActive
            ? "text-cyan-600 dark:text-cyan-400"
            : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
        )}
      />
      <span className="truncate">{route.label}</span>

      {!isActive && (
        <span className="absolute inset-0 rounded-md opacity-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 transition-opacity group-hover:opacity-100" />
      )}
    </Link>
  );
}

/* ── Section label ────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
      {children}
    </p>
  );
}

/* ── User footer card ─────────────────────────────────────────── */
function UserFooter() {
  return (
    <div className="border-t border-cyan-100 dark:border-white/[0.06] p-4">
      <div className="flex items-center gap-3 rounded-md bg-cyan-50 dark:bg-white/[0.03] px-3 py-2.5 ring-1 ring-inset ring-cyan-200 dark:ring-white/[0.06]">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-600 dark:text-cyan-400">
          B
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">Balaji</p>
          <p className="truncate text-[10px] text-zinc-500 dark:text-zinc-500">Free plan</p>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

/* ── Desktop sidebar ──────────────────────────────────────────── */
const DesktopSidebar = () => {
  const pathname = usePathname();
  const activeRoute =
    routes.find((r) => r.href === "/" ? pathname === "/" : pathname.startsWith(r.href)) || routes[0];

  return (
    <aside
      className="hidden md:flex flex-col min-w-[260px] max-w-[260px] h-screen border-r border-cyan-100 dark:border-white/[0.07] bg-white dark:bg-zinc-950"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.06) 0%, transparent 70%)",
      }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-cyan-100 dark:border-white/[0.06] px-4">
        <ScrapeNovaLogo />
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1 overflow-y-auto px-2 py-3">
        <SectionLabel>Navigation</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {routes.map((route) => (
            <NavLink
              key={route.href}
              route={route}
              isActive={route.href === activeRoute.href}
            />
          ))}
        </div>
      </nav>

      <UserFooter />
    </aside>
  );
};

/* ── Mobile sidebar ───────────────────────────────────────────── */
export function MobileSideBar() {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);
  const activeRoute =
    routes.find((r) => r.href === "/" ? pathname === "/" : pathname.startsWith(r.href)) || routes[0];

  return (
    <div className="block border-b border-cyan-100 dark:border-white/[0.07] bg-white dark:bg-zinc-950 md:hidden">
      <nav className="flex h-14 items-center justify-between px-4">
        <ScrapeNovaLogo />

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 dark:text-zinc-400 hover:bg-cyan-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <MenuIcon size={20} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[260px] border-r border-cyan-100 dark:border-white/[0.07] bg-white dark:bg-zinc-950 p-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(6,182,212,0.06) 0%, transparent 70%)",
              }}
            >
              <div className="flex h-14 items-center border-b border-cyan-100 dark:border-white/[0.06] px-4">
                <ScrapeNovaLogo />
              </div>

              <nav className="flex flex-col flex-1 px-2 py-3">
                <SectionLabel>Navigation</SectionLabel>
                <div className="flex flex-col gap-0.5">
                  {routes.map((route) => (
                    <NavLink
                      key={route.href}
                      route={route}
                      isActive={route.href === activeRoute.href}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}

export default DesktopSidebar;
