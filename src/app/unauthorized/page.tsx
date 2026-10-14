import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export const metadata = {
  title: '403 Unauthorized | Access Denied',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldX className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Access Restricted</h1>
          <p className="text-sm text-muted-foreground">
            You do not have the required role or permissions to view this resource.
            Try switching your role in the top navigation or signing in with an authorized account.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="size-4" />
              Return Home
            </Button>
          </Link>
          <Link href="/login">
            <Button className="gap-2">
              <ArrowLeft className="size-4" />
              Switch Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
