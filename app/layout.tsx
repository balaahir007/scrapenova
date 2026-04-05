import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScrapeNova",
  description: "Automate your web scraping workflows",
  icons: {
    icon: "/Headerlogo.png",
    shortcut: "/Headerlogo.png",
    apple: "/Headerlogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl={"/sign-in"}
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-sm !shadow-md",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <AppProviders>{children}</AppProviders>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}