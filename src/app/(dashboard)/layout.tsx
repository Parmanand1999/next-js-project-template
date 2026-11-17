import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/60 dark:bg-slate-950 text-foreground">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col bg-transparent">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/80 bg-background/90 backdrop-blur-md">
            <SidebarTrigger className="ml-3 hover:bg-muted/60 rounded-lg" />
            <div className="flex-1">
              <Navbar />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
