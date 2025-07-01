
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, LifeBuoy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import {
  Sidebar as SidebarPrimitive,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UserNav } from './UserNav';
import type { Dictionary } from '@/types';
import { Button } from '../ui/button';

type SidebarProps = {
  dict: Dictionary;
};

export function Sidebar({ dict }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <SidebarPrimitive variant="sidebar">
      <SidebarHeader className="flex items-center justify-between">
        <Link href={`/dashboard`} className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M15 6v12a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3Z"/><path d="M9 6v12a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z"/></svg>
          </Button>
          <span className="text-lg font-semibold font-headline">{`Admin .Site ${process.env.NEXT_PUBLIC_SITE_NAME || ''}`.trim()}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
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
        </SidebarMenu>

        <SidebarGroup>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="hover:no-underline text-sm font-medium px-2 h-8 rounded-md hover:bg-sidebar-accent">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  <span>{dict.sidebar.instructions}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-2 text-sm text-sidebar-foreground/70 space-y-2">
                 <ReactMarkdown
                  components={{
                    a: ({node, ...props}) => {
                      const href = props.href || '';
                      return <Link href={href} className="text-primary hover:underline" {...props} />
                    },
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-sidebar-foreground" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                  }}
                >
                  {dict.sidebar.instructionsContent}
                </ReactMarkdown>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <UserNav dict={dict} />
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
