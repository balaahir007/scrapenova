// [ScrapeNova theme applied] — components/Logo.tsx
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Zap } from "lucide-react";
import React from "react";

const Logo = ({
  fontSize = "2xl",
  iconSize = 20,
  showText = true,
}: {
  fontSize?: string;
  iconSize?: number;
  showText?: boolean;
}) => {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-3 transition-opacity hover:opacity-80",
        "group"
      )}
      title="ScrapeFlow - Workflow Automation"
    >
      {/* Icon with glow effect */}
      <div className="relative">
        <div className="rounded-lg bg-cyan-500 p-2.5 shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/75 transition-all duration-300">
          <Zap size={iconSize} className="stroke-zinc-950 fill-none" strokeWidth={2.5} />
        </div>
        {/* Animated glow dot */}
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
      </div>
      
      {/* Brand text */}
      {showText && (
        <div className={cn("font-bold tracking-tight", fontSize)}>
          <span className="bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
            Scrape
          </span>
          <span className="text-zinc-900 dark:text-zinc-100">
            Nova
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;

