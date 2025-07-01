import { getDictionary } from '@/lib/dictionaries';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Article } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ContentClient } from '@/components/dashboard/content/ContentClient';

async function getArticles(): Promise<Article[]> {
  const articlesCol = collection(db, 'articles');
  const q = await getDocs(query(articlesCol, orderBy('createdAt', 'desc')));
  return q.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

export default async function ContentPage() {
  const dict = await getDictionary('es');
  const articles = await getArticles();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">{dict.content.title}</h1>
            <p className="text-muted-foreground">{dict.content.description}</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/content/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {dict.content.newArticle}
          </Link>
        </Button>
      </div>
      <ContentClient articles={articles} dict={dict.content} />
    </div>
  );
}
