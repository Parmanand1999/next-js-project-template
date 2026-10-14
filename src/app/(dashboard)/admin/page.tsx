import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/features/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, ShieldAlert, Activity, Database, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | Enterprise Portal',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <ShieldCheck className="size-3.5" />
          Enterprise Administration Control
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Operations Center</h1>
        <p className="text-muted-foreground mt-1">
          Real-time system telemetry, privilege management, and role-based policies.
        </p>
      </div>

      {/* Analytics telemetry cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="1,248"
          change="+12.5%"
          isPositive={true}
          icon={Users}
          description="Registered members"
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
          title="Service Health"
          value="99.98%"
          change="Optimal"
          isPositive={true}
          icon={Database}
          description="Core API cluster"
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
              Manage team members, update assigned security roles, and enforce granular RBAC rules.
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
            <CardTitle>Security & Pipeline Telemetry</CardTitle>
            <CardDescription>
              Status of real-time security guards and service interceptors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-3 text-muted-foreground">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Edge Proxy Route Guards
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Enforcing</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Axios Silent Token Refresh
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Zustand Auth Storage Persistence
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Connected</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
