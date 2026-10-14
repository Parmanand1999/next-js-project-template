import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LayoutDashboard, UserCheck, ShieldCheck, FileText } from 'lucide-react';

export const metadata = {
  title: 'User Portal | Enterprise Next.js',
};

export default function PortalPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
          <LayoutDashboard className="size-3.5" />
          Member Portal
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Your Personal Workspace</h1>
        <p className="text-muted-foreground mt-1">
          Accessible by all registered roles (User, Manager, Admin, Super Admin).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <UserCheck className="size-5" />
            </div>
            <CardTitle>Profile & Credentials</CardTitle>
            <CardDescription>
              Manage your personal contact info, authentication factors, and security keys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ● Verified Account
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle>Access Level</CardTitle>
            <CardDescription>
              Role permissions are dynamically assigned and enforced by Edge Middleware.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">
              Controlled via <code className="font-mono text-foreground font-semibold">src/config/roles.ts</code>
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <FileText className="size-5" />
            </div>
            <CardTitle>Documents & Activity</CardTitle>
            <CardDescription>
              Access your personal transaction logs, downloads, and workspace history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">
              Last synced just now
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
