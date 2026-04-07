"use client";

import { useUser } from "@clerk/nextjs";

export function Greeting() {
  const { user } = useUser();
  const firstName = user?.firstName ?? "there";

  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-500">
        Dashboard
      </p>
      <h1
        className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        style={{ fontFamily: '"Syne", sans-serif' }}
      >
        Good morning, {firstName} 👋
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        Here's what's happening with your scraping workflows.
      </p>
    </div>
  );
}
