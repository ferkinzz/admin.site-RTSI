
'use client';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDictionary } from '@/lib/dictionaries';
import { ContentForm } from '@/components/dashboard/content/ContentForm';
import type { Article, Dictionary } from '@/types';
import { useEffect, useState } from 'react';

export default function EditArticlePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const [article, setArticle] = useState<Article | null>(null);
  const [dict, setDict] = useState<Dictionary['contentForm'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() } as Article);
        } else {
          setError('Article not found');
        }

        const dictionary = await getDictionary('es');
        setDict(dictionary.contentForm);
      } catch (err) {
        console.error(err);
        setError('Failed to load article data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!article || !dict) {
    return <div>Article not found</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl h-full">
      <ContentForm article={article} dict={dict} />
    </div>
  );
}
