
'use client';

import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, Rocket, AlertTriangle } from 'lucide-react';
import type { Dictionary } from '@/types';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLicense } from '@/context/LicenseContext';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type UserNavProps = {
  dict: Dictionary;
};

export function UserNav({ dict }: UserNavProps) {
  const { user, signOut } = useAuth();
  const { plan, licenseKey } = useLicense();
  const [tokenUsage, setTokenUsage] = useState(0);

  const TOKEN_LIMIT = 5_000_000;
  const WARNING_THRESHOLD_PERCENT = 75;

  useEffect(() => {
    if (plan !== 'ai_pro' || !licenseKey) return;

    const tokenRef = doc(db, 'tokenUsage', licenseKey);
    const unsubscribe = onSnapshot(tokenRef, (doc) => {
        if (doc.exists()) {
            setTokenUsage(doc.data().totalTokens || 0);
        }
    });

    return () => unsubscribe();
  }, [plan, licenseKey]);

  const usagePercentage = (tokenUsage / TOKEN_LIMIT) * 100;
  const showTokenWarning = plan === 'ai_pro' && usagePercentage >= WARNING_THRESHOLD_PERCENT;

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {showTokenWarning && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'Admin'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>{dict.settings.title}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/plans">
            <Rocket className="mr-2 h-4 w-4" />
            <span>{dict.settings.activatePlan}</span>
          </Link>
        </DropdownMenuItem>
        <ThemeToggle dict={dict.sidebar} />
        <DropdownMenuSeparator />

        {showTokenWarning && (
            <>
                <DropdownMenuItem asChild className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                <Link href="/dashboard/plans">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span>{dict.sidebar.tokenWarning.replace('{percent}', usagePercentage.toFixed(0))}</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
            </>
        )}

        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{dict.sidebar.logout}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2 text-center text-xs text-muted-foreground">
          Admin.Site construido por el equipo de{' '}
          <a
            href="https://rtsi.site"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            .Site RTSI
          </a>{' '}
          y{' '}
          <a
            href="https://rtsi.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            RTSI.Mx
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
