'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ConductorIssueTicketPage() {
  const router = useRouter();

  useEffect(() => {
    // Graceful automatic redirect to Health module
    const timer = setTimeout(() => {
      router.replace('/conductor/health');
    }, 150);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <Card className="max-w-sm w-full p-6 space-y-4 border-border/80 shadow-md">
        <div className="size-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
          <Activity className="size-7 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-black text-foreground">ETIM Health & Diagnostics</h2>
          <p className="text-xs text-muted-foreground">
            Ticket issuance is now automated via Passenger App QR and contactless validation. Redirecting to ETIM Machine Health...
          </p>
        </div>
        <Link href="/conductor/health" className="block pt-2">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
            <span>Open ETIM Health</span>
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
