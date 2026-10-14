import React from 'react';
import { StatsCard } from '@/features/analytics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Briefcase, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Manager Dashboard | Enterprise Next.js',
};

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-3">
          <Briefcase className="size-3.5" />
          Manager Workspace
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Team & Operations Overview</h1>
        <p className="text-muted-foreground mt-1">
          Review operational metrics, team workload, and department reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Team Projects"
          value="18 Active"
          change="+3 this quarter"
          isPositive={true}
          icon={Briefcase}
        />
        <StatsCard
          title="Team Velocity"
          value="94.2%"
          change="+4.5%"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatsCard
          title="Pending Approvals"
          value="4"
          change="Action required"
          isPositive={false}
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Capability Summary (MANAGER)</CardTitle>
          <CardDescription>
            Defined in <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">src/config/roles.ts</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">View Departmental Reports:</span> Can access aggregated data, project statuses, and team workloads.
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Review Member Directory:</span> Can view member profiles, but cannot delete or alter security roles.
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">User Portal Access:</span> Includes all personal member portal capabilities.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
