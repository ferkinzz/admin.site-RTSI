
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
import { collection, getDocs, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Dictionary, Invitation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Copy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function InvitationsPage() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const dictionary = await getDictionary('es');
        setDict(dictionary);

        const invitationsCol = collection(db, 'invitations');
        const q = await getDocs(query(invitationsCol, orderBy('createdAt', 'desc')));
        const fetchedInvitations = q.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Invitation));
        setInvitations(fetchedInvitations);

      } catch (error) {
        console.error("Failed to fetch invitations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!dict) return;
    try {
      await deleteDoc(doc(db, 'invitations', id));
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      toast({ title: dict.users.invitations.deleteSuccess });
    } catch (error) {
      console.error('Failed to delete invitation:', error);
      toast({ variant: 'destructive', title: 'Error', description: dict.users.invitations.deleteError });
    }
  };

  const handleCopyLink = (tokenId: string) => {
    if (!dict) return;
    const inviteLink = `${window.location.origin}/login?token=${tokenId}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
        toast({ title: dict.users.invitations.copySuccess });
    });
  };

  if (loading || !dict) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="mt-2 h-5 w-96" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  const d = dict.users.invitations;

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="shrink-0">
                <Link href="/dashboard/users">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold font-headline">{d.title}</h1>
                <p className="text-muted-foreground">{d.description}</p>
            </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>{d.tableTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{d.emailColumn}</TableHead>
                            <TableHead>{d.roleColumn}</TableHead>
                            <TableHead>{d.statusColumn}</TableHead>
                            <TableHead>{d.createdByColumn}</TableHead>
                            <TableHead className="hidden sm:table-cell">{d.createdAtColumn}</TableHead>
                            <TableHead className="text-right">{d.actionsColumn}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invitations.length > 0 ? invitations.map((invite) => (
                            <TableRow key={invite.id}>
                                <TableCell className="font-medium">{invite.email}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{dict.users.roles[invite.role] || invite.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={invite.used ? "default" : "outline"}>
                                        {invite.used ? d.status.used : d.status.pending}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{invite.creatorEmail}</TableCell>
                                <TableCell className="hidden sm:table-cell text-muted-foreground">
                                    {invite.createdAt ? formatDistanceToNow(invite.createdAt.toDate(), { addSuffix: true, locale: es }) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {!invite.used && (
                                            <Button variant="ghost" size="icon" onClick={() => handleCopyLink(invite.id)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={invite.used}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{d.deleteDialog.title}</AlertDialogTitle>
                                                    <AlertDialogDescription>{d.deleteDialog.description}</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{dict.login.cancel}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(invite.id)}>{d.deleteAction}</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">{d.noInvitations}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
