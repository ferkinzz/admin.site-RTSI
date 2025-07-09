
'use client';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDictionary } from '@/lib/dictionaries';
import { ContentForm } from '@/components/dashboard/content/ContentForm';
import type { Article, Dictionary } from '@/types';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EditArticlePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { user, loading: authLoading } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [dict, setDict] = useState<Dictionary | null>(null);
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
        setDict(dictionary);
      } catch (err) {
        console.error(err);
        setError('Failed to load article data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading || authLoading) {
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

  const canEdit = user?.role === 'Admin' || user?.role === 'Redactor' || (user?.role === 'Redactor Jr.' && article?.authorId === user?.uid);

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">{dict.content.editAccessDenied.title}</CardTitle>
                <CardDescription>{dict.content.editAccessDenied.description}</CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl h-full">
      <ContentForm article={article} dict={dict} />
    </div>
  );
}
