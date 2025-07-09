
import { getDictionary } from '@/lib/dictionaries';
import { ContentForm } from '@/components/dashboard/content/ContentForm';
// import type { Locale } from '@/types';

export default async function NewArticlePage() {
  const dict = await getDictionary('es');
  return (
    <div className="mx-auto w-full max-w-4xl h-full">
      <ContentForm dict={dict} />
    </div>
  );
}
