'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { Article, Dictionary } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type GetColumnsProps = {
    dict: Dictionary['content'];
}

export const getColumns = ({ dict }: GetColumnsProps): ColumnDef<Article>[] => {
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    console.log('--- Attempting to delete article with ID:', id, '---');
    try {
      await deleteDoc(doc(db, 'articles', id));
      console.log('--- Article deleted successfully from Firebase ---');
      toast({ title: 'Success', description: 'Article deleted successfully.' });
      router.refresh();
    } catch (error) {
      console.error('--- FIREBASE DELETE FAILED ---', error);
      toast({ title: 'Error', description: 'Failed to delete article.', variant: 'destructive' });
    }
  };
    
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {dict.table.title}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'status',
      header: dict.table.status,
      cell: ({ row }) => {
        const status = row.getValue('status') as 'draft' | 'published';
        const variant = status === 'published' ? 'default' : 'secondary';
        const text = status === 'published' ? dict.statusValues.published : dict.statusValues.draft;
        return <Badge variant={variant}>{text}</Badge>;
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{dict.table.actions}</div>,
      cell: ({ row }) => {
        const article = row.original;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        
        const articleUrl = siteUrl && article.slug ? `${siteUrl}${article.slug}` : null;

        return (
          <div className="text-right">
             <AlertDialog>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{dict.table.actions}</DropdownMenuLabel>
                    {articleUrl && (
                        <DropdownMenuItem asChild>
                            <Link href={articleUrl} target="_blank" rel="noopener noreferrer">
                                <Eye />
                                <span>{dict.table.view}</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/content/${article.id}/edit`}>
                        <Pencil />
                        <span>{dict.table.edit}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 />
                        <span>{dict.table.delete}</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{dict.deleteDialog.title}</AlertDialogTitle>
                  <AlertDialogDescription>{dict.deleteDialog.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{dict.deleteDialog.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(article.id!)}>{dict.deleteDialog.continue}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
};
