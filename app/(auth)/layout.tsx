"use client";

import Logo from "@/components/Logo";
import React, { ReactNode } from "react";
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-screen ">
      <Logo/>
      {children}

    </div>
  );
}
export default Layout;