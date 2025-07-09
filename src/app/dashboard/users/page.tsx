'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary, AdminUser, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Users, UserPlus, Edit, Copy, Ticket, Rocket } from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { userRoles } from '@/types';
import { useLicense } from '@/context/LicenseContext';

const inviteFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  role: z.custom<UserRole>((val) => userRoles.includes(val as UserRole), {
    message: 'Por favor, selecciona un rol válido.',
  }),
});

const editRoleFormSchema = z.object({
  role: z.custom<UserRole>((val) => userRoles.includes(val as UserRole)),
});

export default function UsersPage() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const { user: authUser, loading: authLoading } = useAuth();
  const { plan } = useLicense();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isPro = plan === 'pro' || plan === 'ai_pro';
  const isAdmin = authUser?.role === 'Admin';
  
  // State for dialogs
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [generatedLink, setGeneratedLink] = useState('');
  
  const inviteForm = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: '', role: 'Redactor Jr.' },
  });

  const editRoleForm = useForm<z.infer<typeof editRoleFormSchema>>({
    resolver: zodResolver(editRoleFormSchema),
  });

  useEffect(() => {
    getDictionary('es').then(setDict);
  }, []);

  useEffect(() => {
    if (!isPro || !isAdmin || authLoading) {
      setLoading(false);
      return;
    }

    async function fetchUsers() {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AdminUser[];
        setUsers(usersList.sort((a,b) => a.email.localeCompare(b.email)));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [isPro, isAdmin, authLoading]);
  
  useEffect(() => {
    if (editingUser) {
      editRoleForm.reset({ role: editingUser.role });
    }
  }, [editingUser, editRoleForm]);
  
  const onInviteSubmit = async (values: z.infer<typeof inviteFormSchema>) => {
    if (!dict || !authUser) return;
    try {
      const newInviteRef = doc(collection(db, 'invitations'));
      const token = newInviteRef.id;

      await setDoc(newInviteRef, {
        email: values.email,
        role: values.role,
        token: token,
        createdAt: serverTimestamp(),
        used: false,
        creatorId: authUser.uid,
        creatorEmail: authUser.email,
      });

      const inviteLink = `${window.location.origin}/login?token=${token}`;
      setGeneratedLink(inviteLink);
      toast({ title: dict.users.linkGeneratedSuccess });

    } catch (error) {
      console.error("Error creating invitation:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create invitation link.' });
    }
  };
  
  const onEditRoleSubmit = async (values: z.infer<typeof editRoleFormSchema>) => {
    if (!editingUser || !dict) return;

    try {
        const userRef = doc(db, 'users', editingUser.id);
        await updateDoc(userRef, {
            role: values.role,
        });

        setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: values.role } : u));
        setEditingUser(null);
        toast({ title: dict.users.roleUpdatedSuccess });

    } catch (error) {
        console.error("Error updating role:", error);
        toast({ variant: 'destructive', title: 'Error', description: dict.users.roleUpdatedError });
    }
  };

  const handleCopyLink = () => {
    if (!dict) return;
    navigator.clipboard.writeText(generatedLink).then(() => {
        toast({ title: dict.users.copyLink });
    });
  };

  if (authLoading || !dict) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-9 w-72" />
            <Skeleton className="h-5 w-96" />
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
  
  const d = dict.users;

  if (!isPro) {
    return (
      <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center">
              <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                     <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{d.upgradeTitle}</CardTitle>
                  <CardDescription>{d.upgradeDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground">{d.upgradeButton}</p>
              </CardContent>
          </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center">
              <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                     <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{d.adminOnlyTitle}</CardTitle>
                  <CardDescription>{d.adminOnlyDescription}</CardDescription>
              </CardHeader>
          </Card>
      </div>
    );
  }
  
  if (loading) {
    return (
        <div className="space-y-4">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
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


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">{d.title}</h1>
            <p className="text-muted-foreground">{d.description}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/dashboard/users/invitations">
                    <Ticket className="mr-2 h-4 w-4" />
                    {d.viewInvitations}
                </Link>
            </Button>
            <Dialog open={isInviteDialogOpen} onOpenChange={(open) => {
                setInviteDialogOpen(open);
                if (!open) {
                    setGeneratedLink('');
                    inviteForm.reset();
                }
            }}>
                <DialogTrigger asChild>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {d.inviteUser}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{d.inviteUserTitle}</DialogTitle>
                        <DialogDescription>{d.inviteUserDescription}</DialogDescription>
                    </DialogHeader>
                    {generatedLink ? (
                        <div className="space-y-4 pt-4">
                            <Label>{d.inviteLink}</Label>
                            <div className="flex items-center gap-2">
                            <Input value={generatedLink} readOnly />
                            <Button size="icon" onClick={handleCopyLink}><Copy className="h-4 w-4"/></Button>
                            </div>
                            <p className="text-sm text-muted-foreground">{d.inviteLinkDescription}</p>
                        </div>
                    ) : (
                        <Form {...inviteForm}>
                            <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                                <FormField
                                    control={inviteForm.control}
                                    name="email"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{dict.login.emailLabel}</FormLabel>
                                        <FormControl>
                                        <Input type="email" placeholder="usuario@ejemplo.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={inviteForm.control}
                                    name="role"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{d.roleColumn}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {userRoles.map(role => (
                                                <SelectItem key={role} value={role}>{d.roles[role]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="ghost">{dict.login.cancel}</Button></DialogClose>
                                    <Button type="submit" disabled={inviteForm.formState.isSubmitting}>
                                        {inviteForm.formState.isSubmitting ? 'Generando...' : d.generateLink}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>{d.tableTitle}</CardTitle>
            <CardDescription>{d.tableDescription}</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{d.emailColumn}</TableHead>
                        <TableHead>{d.roleColumn}</TableHead>
                        <TableHead className="text-right">{d.actionsColumn}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{d.roles[user.role] || user.role}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Dialog onOpenChange={(open) => !open && setEditingUser(null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            {d.editRole}
                                        </Button>
                                    </DialogTrigger>
                                    {editingUser && editingUser.id === user.id && (
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{d.editRoleTitle} {editingUser.email}</DialogTitle>
                                                <DialogDescription>{d.editRoleDescription}</DialogDescription>
                                            </DialogHeader>
                                            <Form {...editRoleForm}>
                                                <form onSubmit={editRoleForm.handleSubmit(onEditRoleSubmit)} className="space-y-4 py-4">
                                                    <FormField
                                                        control={editRoleForm.control}
                                                        name="role"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                            <FormLabel>{d.roleColumn}</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {userRoles.map(role => (
                                                                        <SelectItem key={role} value={role}>{d.roles[role]}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                     <DialogFooter>
                                                        <DialogClose asChild><Button type="button" variant="ghost">{dict.login.cancel}</Button></DialogClose>
                                                        <Button type="submit" disabled={editRoleForm.formState.isSubmitting}>
                                                            {editRoleForm.formState.isSubmitting ? 'Guardando...' : d.saveChanges}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    )}
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
