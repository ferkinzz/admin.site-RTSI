import { getDictionary } from '@/lib/dictionaries';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const dict = await getDictionary('es');

  return <DashboardClient dict={dict.dashboard} />;
}
