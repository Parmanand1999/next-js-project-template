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
    <SidebarProvider className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-foreground">
      <AppSidebar />
      <SidebarInset className="flex flex-1 min-w-0 flex-col bg-transparent overflow-x-clip">
        {/* Rock-solid Sticky Header Bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-border/80 bg-background/95 backdrop-blur-md transition-shadow">
          <SidebarTrigger className="ml-3 hover:bg-muted/70 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <Navbar />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
