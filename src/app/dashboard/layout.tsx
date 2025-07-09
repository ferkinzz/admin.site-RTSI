
import { getDictionary } from '@/lib/dictionaries';
// import type { Locale } from '@/types';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SiteConfig, PublicConfig } from '@/types';
import { UserNav } from '@/components/dashboard/UserNav';
import { DynamicTitleHandler } from '@/components/dashboard/DynamicTitleHandler';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary('es');

  let siteConfig: SiteConfig = {};
  let publicConfig: PublicConfig = {};

  try {
    const siteConfigRef = doc(db, 'siteConfig', 'default-site');
    const publicConfigRef = doc(db, 'publicConfig', 'main');
    
    const [siteConfigSnap, publicConfigSnap] = await Promise.all([
      getDoc(siteConfigRef),
      getDoc(publicConfigRef),
    ]);

    if (siteConfigSnap.exists()) {
      siteConfig = siteConfigSnap.data() as SiteConfig;
    }
    if (publicConfigSnap.exists()) {
      publicConfig = publicConfigSnap.data() as PublicConfig;
    }

  } catch (error) {
    console.error("Failed to fetch site/public config for dashboard layout", error);
  }

  return (
    <SidebarProvider>
      <DynamicTitleHandler siteName={siteConfig.siteName} />
      <div className="flex h-full overflow-hidden bg-background">
        <Sidebar dict={dict} siteName={siteConfig.siteName} logoUrl={publicConfig.loginLogoUrl} />
        <div className="flex flex-col flex-1 w-0">
            <header className="relative z-10 flex items-center justify-between h-14 px-4 font-medium border-b shrink-0 bg-background">
              <div className='flex items-center gap-2'>
                <SidebarTrigger />
                <Link href={`/dashboard`} className="flex items-center gap-2 text-lg font-semibold font-headline md:hidden">
                    {`Admin .Site ${siteConfig.siteName || ''}`.trim()}
                </Link>
              </div>
              <UserNav dict={dict} />
          </header>
          <main className="flex-1 bg-muted/40 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">
                  {children}
              </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
