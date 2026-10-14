'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, Role, ROLE_LABELS } from '@/config/roles';
import { useSession } from '../hooks/useSession';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login } = useSession();
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES.ADMIN);
  const [name, setName] = useState('Alex Johnson');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, name);

    // Route based on role
    if (selectedRole === ROLES.SUPER_ADMIN || selectedRole === ROLES.ADMIN) {
      router.push('/admin');
    } else if (selectedRole === ROLES.MANAGER) {
      router.push('/manager');
    } else {
      router.push('/portal');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-border/60">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Enterprise Portal</CardTitle>
        <CardDescription>
          Sign in to test role-based access control and feature slicing
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Role for Testing
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_LABELS).map(([roleKey, label]) => {
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setSelectedRole(roleKey as Role)}
                    className={`p-3 text-left rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                        : 'border-border/80 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="font-semibold text-xs">{label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {roleKey === ROLES.SUPER_ADMIN && 'Full system access'}
                      {roleKey === ROLES.ADMIN && 'Admin + Users access'}
                      {roleKey === ROLES.MANAGER && 'Reports + Teams'}
                      {roleKey === ROLES.USER && 'Personal portal only'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button type="submit" className="w-full h-10 gap-2 font-medium">
            <Lock className="size-4" />
            Continue as {ROLE_LABELS[selectedRole]}
            <ArrowRight className="size-4 ml-auto" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
