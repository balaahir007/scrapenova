"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ViewAllButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/workflows")}
      className="gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400"
    >
      View all <ArrowRight size={12} />
    </Button>
  );
}
