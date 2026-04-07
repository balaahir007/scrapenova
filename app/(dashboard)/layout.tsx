// [ScrapeNova theme applied] — layout.tsx
"use client";

import BreadcrumbHeader from "@/components/BreadcrumbHeader";
import DesktopSidebar, { MobileSideBar } from "@/components/Sidebar";
import { ModeToggle } from "@/components/ThemeModeToggle";
import Logo from "@/components/Logo";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Separator } from "@radix-ui/react-separator";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <MobileSideBar />
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <header className="hidden md:flex shadow items-center justify-between px-6 py-4 h-[67px] bg-background/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
          {/* <Logo fontSize="text-lg" iconSize={20} /> */}
          <h1 className="text-sm">Home</h1>
          <div className="gap-1 flex flex-center">
            <ModeToggle />
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </header>
        <Separator className="divider hidden md:block" />
        <div className="overflow-auto">
          <div className="flex-1 mx-auto container py-4 px-4 text-accent-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
