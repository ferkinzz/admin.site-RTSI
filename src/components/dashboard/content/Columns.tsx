
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { Article, Dictionary, SiteConfig, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type GetColumnsProps = {
    dict: Dictionary;
    siteConfig?: SiteConfig | null;
    user: User | null;
}

export const getColumns = ({ dict, siteConfig, user }: GetColumnsProps): ColumnDef<Article>[] => {
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
            {dict.content.table.title}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'status',
      header: dict.content.table.status,
      cell: ({ row }) => {
        const status = row.getValue('status') as 'draft' | 'published';
        const variant = status === 'published' ? 'default' : 'secondary';
        const text = status === 'published' ? dict.content.statusValues.published : dict.content.statusValues.draft;
        return <Badge variant={variant}>{text}</Badge>;
      },
    },
    {
      accessorKey: 'articleType',
      header: dict.content.table.type,
      cell: ({ row }) => {
        const article = row.original;
        const type = article.articleType as keyof Dictionary['contentForm']['articleTypeValues'];
        let displayType;

        if (type === 'other' && article.otherArticleType) {
            displayType = article.otherArticleType;
        } else {
            displayType = dict.contentForm.articleTypeValues[type] ?? article.articleType;
        }

        return <div className="capitalize">{displayType}</div>
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{dict.content.table.actions}</div>,
      cell: ({ row }) => {
        const article = row.original;
        const siteUrl = siteConfig?.siteUrl;

        const isAdmin = user?.role === 'Admin';
        const isRedactor = user?.role === 'Redactor';
        const isOwner = user?.uid === article.authorId;
        const canEdit = isAdmin || isRedactor || (user?.role === 'Redactor Jr.' && isOwner);
        const canDelete = isAdmin;

        const formatPath = (p: string = '/') => {
            let formatted = p.trim();
            if (!formatted) return '/';
            if (!formatted.startsWith('/')) {
                formatted = `/${formatted}`;
            }
            if (formatted.endsWith('/') && formatted.length > 1) {
                formatted = formatted.slice(0, -1);
            }
            return formatted;
        };

        let path;
        switch (article.articleType) {
            case 'blog':
                path = formatPath(siteConfig?.blogPath);
                break;
            case 'resource':
                path = formatPath(siteConfig?.resourcesPath);
                break;
            case 'video':
                path = formatPath(siteConfig?.videosPath);
                break;
            case 'other':
                path = formatPath(siteConfig?.otherPath);
                break;
            default:
                path = formatPath(siteConfig?.blogPath || '/');
        }

        const slug = article.slug?.startsWith('/') ? article.slug.substring(1) : article.slug;
        const articleUrl = siteUrl && slug ? `${siteUrl}${path}/${slug}` : null;

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
                  <DropdownMenuLabel>{dict.content.table.actions}</DropdownMenuLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full" tabIndex={0}>
                            <DropdownMenuItem asChild disabled={!articleUrl}>
                              <Link
                                href={articleUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-disabled={!articleUrl}
                                onClick={(e) => !articleUrl && e.preventDefault()}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>{dict.content.table.view}</span>
                              </Link>
                            </DropdownMenuItem>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dict.content.table.viewTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                  {canEdit && (
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/content/${article.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>{dict.content.table.edit}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{dict.content.table.delete}</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{dict.content.deleteDialog.title}</AlertDialogTitle>
                  <AlertDialogDescription>{dict.content.deleteDialog.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{dict.content.deleteDialog.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(article.id!)}>{dict.content.deleteDialog.continue}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
};
