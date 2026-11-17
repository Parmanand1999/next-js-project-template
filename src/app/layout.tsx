import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SANCHALAN | DTC Operations Command Center",
  description: "Official Delhi Transport Corporation Transit & Vigilance Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
