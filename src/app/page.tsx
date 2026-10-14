'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/features/auth';
import { ROLES, ROLE_LABELS } from '@/config/roles';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Layers,
  Lock,
  ArrowRight,
  FolderTree,
  CheckCircle2,
  Users,
  Briefcase,
  LayoutDashboard,
  Code2,
} from 'lucide-react';

export default function HomePage() {
  const { session, switchRole } = useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="border-b border-border/80 bg-background/95 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2.5 font-bold text-lg">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="size-4" />
            </div>
            <span>NextEnterprise</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login Demo
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="sm">Open Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Layers className="size-3.5" />
            Feature-Based Architecture + Modular RBAC
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground">
            Professional Next.js Architecture for Large Projects
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Engineered with a clean <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm">src/</code> base,
            vertical feature slicing (<code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm">features/*</code>),
            and multi-role access control for enterprise applications.
          </p>

          {/* Interactive Role Switcher Bar */}
          <div className="pt-6">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl border border-border bg-card shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground uppercase px-2 flex items-center gap-1.5">
                <Lock className="size-3.5" />
                Current Role:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(ROLES).map((role) => {
                  const isActive = session?.role === role;
                  return (
                    <button
                      key={role}
                      onClick={() => switchRole(role)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition font-medium ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                          : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {ROLE_LABELS[role]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Role Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {/* Admin Portal Card */}
          <Card className="hover:border-primary/50 transition-all flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                  <Users className="size-5" />
                </div>
                <Badge variant="destructive">SUPER_ADMIN & ADMIN</Badge>
              </div>
              <CardTitle>Admin & User Management</CardTitle>
              <CardDescription>
                System telemetry, user privilege assignment, security audits, and global control.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Route: <code className="font-mono text-foreground font-semibold">/admin</code> & <code className="font-mono text-foreground font-semibold">/admin/users</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Features: <code className="font-mono text-foreground">features/users</code>, <code className="font-mono text-foreground">features/analytics</code>
                </div>
              </div>
              <Link href="/admin" className="block pt-2">
                <Button className="w-full gap-2" variant="outline">
                  Enter Admin Area
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manager Workspace Card */}
          <Card className="hover:border-primary/50 transition-all flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Briefcase className="size-5" />
                </div>
                <Badge variant="warning">MANAGER</Badge>
              </div>
              <CardTitle>Manager Overview</CardTitle>
              <CardDescription>
                Department tracking, team velocity, project approvals, and aggregated reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Route: <code className="font-mono text-foreground font-semibold">/manager</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Access: Aggregated operational analytics
                </div>
              </div>
              <Link href="/manager" className="block pt-2">
                <Button className="w-full gap-2" variant="outline">
                  Enter Manager Workspace
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Portal Card */}
          <Card className="hover:border-primary/50 transition-all flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <LayoutDashboard className="size-5" />
                </div>
                <Badge variant="secondary">ALL ROLES</Badge>
              </div>
              <CardTitle>Member Portal</CardTitle>
              <CardDescription>
                Personal dashboard, self-service profile, transaction logs, and documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Route: <code className="font-mono text-foreground font-semibold">/portal</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Access: Open to every authenticated user
                </div>
              </div>
              <Link href="/portal" className="block pt-2">
                <Button className="w-full gap-2" variant="outline">
                  Enter Member Portal
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Architecture Pillars Section */}
        <div className="mt-20 border-t border-border/80 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight">Enterprise Architectural Pillars</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Why this folder organization scales seamlessly to 100+ developers and complex domains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderTree className="size-5" />
              </div>
              <h3 className="font-bold text-base">1. src/ Base & Thin App Router</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <code className="font-mono text-xs">src/app/</code> contains only layouts, route definitions, and page parameters. Business logic does not live in page files.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers className="size-5" />
              </div>
              <h3 className="font-bold text-base">2. Feature Slicing (Vertical Modules)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Features like <code className="font-mono text-xs">auth</code>, <code className="font-mono text-xs">users</code>, and <code className="font-mono text-xs">analytics</code> keep their own components, hooks, actions, schemas, and types together.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Code2 className="size-5" />
              </div>
              <h3 className="font-bold text-base">3. Centralized RBAC Matrix</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Roles, permissions, and route policies are unified in <code className="font-mono text-xs">src/config/roles.ts</code>, enforced seamlessly by Edge Middleware and React guards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
