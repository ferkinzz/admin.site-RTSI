
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getCountFromServer, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import type { Dictionary, Article } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, BookCheck, FileText, Pencil, BookOpenCheck, FileArchive, Video, Boxes } from 'lucide-react';

type DashboardClientProps = {
  dict: Dictionary['dashboard'];
};

const chartConfig = {
  total: {
    label: 'Total',
  },
  blog: {
    label: 'Blog',
    color: 'hsl(var(--chart-1))',
  },
  resource: {
    label: 'Resource',
    color: 'hsl(var(--chart-2))',
  },
  video: {
    label: 'Video',
    color: 'hsl(var(--chart-3))',
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export function DashboardClient({ dict }: DashboardClientProps) {
  const [stats, setStats] = useState({ total: 0, drafts: 0, published: 0 });
  const [typeCounts, setTypeCounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const articlesCollection = collection(db, 'articles');

    const fetchDashboardData = async () => {
      setLoading(true);

      // Stats
      const totalSnapshot = await getCountFromServer(articlesCollection);
      const draftsQuery = query(articlesCollection, where('status', '==', 'draft'));
      const draftsSnapshot = await getCountFromServer(draftsQuery);
      const publishedQuery = query(articlesCollection, where('status', '==', 'published'));
      const publishedSnapshot = await getCountFromServer(publishedQuery);
      setStats({
        total: totalSnapshot.data().count,
        drafts: draftsSnapshot.data().count,
        published: publishedSnapshot.data().count,
      });

      // Type Counts
      const articleTypes = ['blog', 'resource', 'video', 'other'];
      const dataPromises = articleTypes.map(async (type) => {
        const q = query(articlesCollection, where('articleType', '==', type));
        const snapshot = await getCountFromServer(q);
        const typeLabel = dict.contentTypes[type as keyof typeof dict.contentTypes] || type;
        return { name: type, label: typeLabel, total: snapshot.data().count };
      });
      const data = await Promise.all(dataPromises);
      setTypeCounts(data);
      setLoading(false); // Initial load done
    };

    fetchDashboardData();

  }, [dict.contentTypes]);

  const getStatusVariant = (status: 'draft' | 'published') => {
    return status === 'published' ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-24" /><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-24" /><Pencil className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-24" /><BookCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /></CardContent></Card>
        </div>
        <div className="space-y-2 pt-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const getIconForType = (typeName: string) => {
    switch (typeName) {
        case 'blog': return <BookOpenCheck className="h-4 w-4 text-muted-foreground" />;
        case 'resource': return <FileArchive className="h-4 w-4 text-muted-foreground" />;
        case 'video': return <Video className="h-4 w-4 text-muted-foreground" />;
        case 'other': return <Boxes className="h-4 w-4 text-muted-foreground" />;
        default: return null;
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">{dict.title}</h1>
        <p className="text-muted-foreground">{dict.welcomeSubtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dict.totalArticles}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dict.drafts}</CardTitle>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dict.published}</CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2 pt-4">
          <h2 className="text-2xl font-bold font-headline">{dict.contentTypeTitle}</h2>
          <p className="text-muted-foreground">{dict.contentTypeDescription}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {typeCounts.map((type) => (
            <Link href="/dashboard/content" key={type.name} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
                <Card className="hover:bg-muted/50 transition-colors h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
                    {getIconForType(type.name)}
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{type.total}</div>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>


      {/* 
        =====================================================================
        == CÓDIGO DEL DASHBOARD ANTERIOR (GRÁFICO Y ACTIVIDAD RECIENTE)    ==
        == Comentado como solicitaste para posible uso futuro.             ==
        =====================================================================

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>{dict.recentActivity.title}</CardTitle>
                <CardDescription>{dict.recentActivity.description}</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/content">
                    {dict.recentActivity.viewAll}
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{dict.recentActivity.articleTitle}</TableHead>
                        <TableHead className="hidden sm:table-cell">{dict.recentActivity.status}</TableHead>
                        <TableHead className="text-right">{dict.recentActivity.lastUpdated}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentArticles.length > 0 ? recentArticles.map((article) => (
                        <TableRow key={article.id}>
                            <TableCell>
                                <Link href={`/dashboard/content/${article.id}/edit`} className="font-medium hover:underline">
                                    {article.title}
                                </Link>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge variant={getStatusVariant(article.status)}>
                                    {dict.statusValues[article.status]}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {article.updatedAt ? formatDistanceToNow(article.updatedAt.toDate(), { addSuffix: true, locale: es }) : 'N/A'}
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">{dict.recentActivity.noArticles}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dict.contentBreakdown.title}</CardTitle>
            <CardDescription>{dict.contentBreakdown.description}</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            width={80}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                labelKey="total"
                                indicator="dot"
                                hideLabel
                            />}
                        />
                        <Bar dataKey="total" radius={5} />
                    </BarChart>
                </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      */}
    </div>
  );
}
