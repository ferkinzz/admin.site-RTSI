
import { getDictionary } from '@/lib/dictionaries';
// import type { Locale } from '@/types';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary('es');
  return (
    <SidebarProvider>
      <div className="flex h-full overflow-hidden bg-background">
        <Sidebar dict={dict} />
        <div className="flex flex-col flex-1 w-0">
            <header className="relative z-10 flex items-center justify-between h-14 px-4 font-medium border-b shrink-0 bg-background">
            <SidebarTrigger />
            <Link href={`/dashboard`} className="flex items-center gap-2 text-lg font-semibold font-headline md:hidden">
                {`Admin .Site ${process.env.NEXT_PUBLIC_SITE_NAME || ''}`.trim()}
            </Link>
            <div className="w-8 md:hidden" />
          </header>
          <main className="flex-1 bg-muted/40 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8 h-full">
                  {children}
              </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
