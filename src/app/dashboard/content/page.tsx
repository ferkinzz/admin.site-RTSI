
'use client';

import { useEffect, useState } from 'react';
import { getDictionary } from '@/lib/dictionaries';
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Article, Dictionary, SiteConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ContentClient } from '@/components/dashboard/content/ContentClient';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContentPage() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dictionary = await getDictionary('es');
        setDict(dictionary);

        const articlesCol = collection(db, 'articles');
        const q = await getDocs(query(articlesCol, orderBy('createdAt', 'desc')));
        const fetchedArticles = q.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
        setArticles(fetchedArticles);

        const configRef = doc(db, 'siteConfig', 'default-site');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          setSiteConfig(configSnap.data() as SiteConfig);
        }
      } catch (error) {
        console.error("Failed to fetch content data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !dict) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-9 w-72" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="rounded-md border">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

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
      <ContentClient
        articles={articles}
        dict={dict}
        siteConfig={siteConfig}
      />
    </div>
  );
}
