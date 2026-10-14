import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/features/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, ShieldAlert, Activity, Database, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | Enterprise Next.js',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 mb-3">
          <ShieldAlert className="size-3.5" />
          Restricted Area: Admin & Super Admin Only
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Center</h1>
        <p className="text-muted-foreground mt-1">
          System telemetry, user privilege management, and role-based policies.
        </p>
      </div>

      {/* Analytics feature cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="1,248"
          change="+12.5%"
          isPositive={true}
          icon={Users}
          description="vs last 30 days"
        />
        <StatsCard
          title="Active Sessions"
          value="342"
          change="+8.1%"
          isPositive={true}
          icon={Activity}
          description="Real-time online users"
        />
        <StatsCard
          title="Security Incidents"
          value="0"
          change="Clean"
          isPositive={true}
          icon={ShieldAlert}
          description="Past 7 days"
        />
        <StatsCard
          title="Database Health"
          value="99.98%"
          change="Optimal"
          isPositive={true}
          icon={Database}
          description="Primary cluster"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User & Permission Management</CardTitle>
            <CardDescription>
              Assign roles, revoke access, and review member directory.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Direct access to the user vertical slice with fine-grained RBAC action controls.
            </p>
            <Link href="/admin/users">
              <Button className="gap-2">
                Open User Management
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Slicing Architecture</CardTitle>
            <CardDescription>
              Vertical slice modularity in Next.js App Router.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <strong className="text-foreground">features/auth:</strong> Login, session hooks & types
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <strong className="text-foreground">features/users:</strong> User directory & RBAC actions
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <strong className="text-foreground">features/analytics:</strong> KPI cards & metrics
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
