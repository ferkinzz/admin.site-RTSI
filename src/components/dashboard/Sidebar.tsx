
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, FileText, LifeBuoy, Settings2, Wrench, Users, Lock, Router } from 'lucide-react';

import {
  Sidebar as SidebarPrimitive,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import type { Dictionary } from '@/types';
import { Button } from '../ui/button';
// import { DevLicenseSwitcher } from './DevLicenseSwitcher';
import { useLicense } from '@/context/LicenseContext';
import { useAuth } from '@/context/AuthContext';

type SidebarProps = {
  dict: Dictionary;
  siteName?: string;
  logoUrl?: string;
};

export function Sidebar({ dict, siteName, logoUrl }: SidebarProps) {
  const pathname = usePathname();
  const { plan } = useLicense();
  const { user } = useAuth();
  
  const isProOrHigher = plan === 'pro' || plan === 'ai_pro';

  const isAdmin = user?.role === 'Admin';
  const canManageUsers = isProOrHigher && isAdmin;
  const canAccessSettings = isAdmin;
  const canAccessTools = isProOrHigher && (user?.role === 'Admin' || user?.role === 'Redactor' || user?.role === 'Redactor Jr.');
  
  let usersTooltip = dict.sidebar.usersTooltip;
  if (!isProOrHigher) {
    usersTooltip = dict.sidebar.proUsersTooltip;
  } else if (!isAdmin) {
    usersTooltip = dict.sidebar.adminOnlyTooltip;
  }
  
  const proButWrongRoleForTools = isProOrHigher && !canAccessTools;
  let toolsTooltip = dict.sidebar.toolsTooltip;
  if (!isProOrHigher) {
    toolsTooltip = dict.sidebar.proToolsTooltip;
  } else if (proButWrongRoleForTools) {
    toolsTooltip = dict.sidebar.roleToolsTooltip;
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path;
    return pathname.startsWith(path);
  }

  const finalSiteName = isProOrHigher ? siteName : '';
  const finalLogoUrl = isProOrHigher && logoUrl ? logoUrl : '/android-chrome-512x512.png';

  return (
    <SidebarPrimitive variant="sidebar">
      <SidebarHeader className="flex items-center justify-between">
        <Link href={`/dashboard`} className="flex items-center gap-2">
          <div className="flex items-center justify-center shrink-0 h-14 w-14">
            <Router className="h-12 w-12 text-primary" />
          </div>
          <span className="text-lg font-semibold font-headline">{`Admin .Site ${finalSiteName || ''}`.trim()}</span>
        </Link>
      </SidebarHeader>

      <div className="px-4 pt-2 pb-4">
        <div className="relative w-full h-16 bg-muted/20 rounded-md">
            <Image
                src={finalLogoUrl}
                alt="Logo del Sitio"
                fill
                className="object-contain p-2"
                priority
            />
        </div>
      </div>

      <SidebarContent className="pt-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
              <Link href={`/dashboard`}>
                <Home />
                {dict.sidebar.dashboard}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dashboard/content')}>
              <Link href={`/dashboard/content`}>
                <FileText />
                {dict.sidebar.content}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/users')}
              aria-disabled={!canManageUsers}
              className={!canManageUsers ? 'text-muted-foreground cursor-not-allowed opacity-50' : ''}
              tooltip={usersTooltip}
            >
              <Link 
                href={canManageUsers ? `/dashboard/users` : '#'}
                onClick={(e) => { if (!canManageUsers) e.preventDefault(); }}
              >
                <Users />
                {dict.sidebar.users}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/site-settings')}
              aria-disabled={!canAccessSettings}
              className={!canAccessSettings ? 'text-muted-foreground cursor-not-allowed opacity-50' : ''}
              tooltip={!canAccessSettings ? dict.sidebar.adminOnlyTooltip : dict.sidebar.settingsTooltip}
            >
              <Link
                href={canAccessSettings ? `/dashboard/site-settings` : '#'}
                onClick={(e) => { if (!canAccessSettings) e.preventDefault(); }}
              >
                <Settings2 />
                {dict.sidebar.siteSettings}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/tools')}
              aria-disabled={!canAccessTools}
              className={!canAccessTools ? 'text-muted-foreground cursor-not-allowed opacity-50' : ''}
              tooltip={toolsTooltip}
            >
              <Link 
                href={canAccessTools ? `/dashboard/tools` : '#'}
                onClick={(e) => { if (!canAccessTools) e.preventDefault(); }}
              >
                <Wrench />
                {dict.sidebar.tools}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dashboard/instructions')}>
              <Link href={`/dashboard/instructions`}>
                <LifeBuoy />
                {dict.sidebar.instructions}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* {process.env.NODE_ENV === 'development' && <DevLicenseSwitcher />} */}
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
