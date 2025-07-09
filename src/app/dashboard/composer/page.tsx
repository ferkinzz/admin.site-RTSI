
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import { Loader2, ShieldCheck, RefreshCw, AlertTriangle, Lock } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';

const EXPECTED_DOCS = [
  { path: 'siteConfig/default-site',
    defaultData: { siteName: 'Mi Sitio', deployHookUrl: '', siteUrl: '', blogPath: '/blog', resourcesPath: '/recursos', videosPath: '/videos', otherPath: '/archivo' }
  },
  { path: 'publicConfig/main',
    defaultData: { loginLogoUrl: '' }
  }
];

const COLLECTIONS_TO_NUKE = ['articles', 'profiles', 'users', 'invitations', 'siteConfig', 'publicConfig', 'license'];
const COLLECTIONS_TO_RESET = ['articles', 'profiles', 'users', 'invitations', 'license'];

export default function ComposerPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dict, setDict] = useState<Dictionary['composer'] | null>(null);

  const [checkingSchema, setCheckingSchema] = useState(false);
  const [schemaResult, setSchemaResult] = useState<string[] | null>(null);
  const [applyingFix, setApplyingFix] = useState(false);

  const [isResetting, setIsResetting] = useState(false);
  const [isNuking, setIsNuking] = useState(false);
  
  const [isNukeDialogOpen, setNukeDialogOpen] = useState(false);
  const [nukeConfirmation, setNukeConfirmation] = useState('');
  
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchDict() {
        const d = await getDictionary('es');
        setDict(d.composer);
    }
    fetchDict();
  }, []);

  const handleSchemaCheck = async () => {
    if (!dict) return;
    setCheckingSchema(true);
    setSchemaResult(null);
    const missingDocs = [];
    try {
      for (const expected of EXPECTED_DOCS) {
        const docRef = doc(db, expected.path);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          missingDocs.push(dict.schemaCard.missingDoc.replace('{path}', expected.path));
        }
      }
      setSchemaResult(missingDocs);
    } catch (error) {
      console.error(error);
      setSchemaResult([dict.schemaCard.checkError]);
    } finally {
      setCheckingSchema(false);
    }
  };

  const handleApplyFix = async () => {
    if (!schemaResult || schemaResult.length === 0 || !dict) return;
    setApplyingFix(true);
    try {
      const batch = writeBatch(db);
      for (const expected of EXPECTED_DOCS) {
        if (schemaResult.some(msg => msg.includes(expected.path))) {
            const docRef = doc(db, expected.path);
            batch.set(docRef, expected.defaultData);
        }
      }
      await batch.commit();
      toast({ title: dict.toastSuccess, description: dict.schemaCard.fixSuccess });
      await handleSchemaCheck(); // Re-check to confirm
    } catch (error) {
      console.error(error);
      toast({ title: dict.toastError, description: dict.schemaCard.fixError, variant: 'destructive' });
    } finally {
      setApplyingFix(false);
    }
  };

  const deleteCollection = async (collectionName: string) => {
    if (!dict) throw new Error("Dictionary not loaded");
    try {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      if (querySnapshot.empty) return;

      const batch = writeBatch(db);
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast({ title: dict.resetCard.resettingToast.replace('{collectionName}', collectionName) });
    } catch (error) {
      console.error(`Error eliminando la colección ${collectionName}:`, error);
      toast({ title: dict.toastError, description: `No se pudo eliminar la colección ${collectionName}.`, variant: 'destructive' });
      throw error; // Propagate error to stop sequence
    }
  };

  const handleReset = async () => {
    if (!dict) return;
    setIsResetting(true);
    try {
      for (const collectionName of COLLECTIONS_TO_RESET) {
        await deleteCollection(collectionName);
      }
      toast({ title: 'Sistema Reiniciado', description: dict.resetCard.successToast });
      await signOut();
    } catch (error) {
       toast({ title: dict.toastError, description: dict.resetCard.errorToast, variant: 'destructive' });
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };

  const handleNuke = async () => {
    if (!dict) return;
    if (nukeConfirmation !== 'DELETE') {
      toast({ title: dict.nukeCard.incorrectConfirmation, description: dict.nukeCard.incorrectConfirmationDesc, variant: 'destructive' });
      return;
    }
    setIsNuking(true);
    try {
      for (const collectionName of COLLECTIONS_TO_NUKE) {
        await deleteCollection(collectionName);
      }
      toast({ title: 'Base de Datos Eliminada', description: dict.nukeCard.successToast });
      await signOut();
    } catch (error) {
       toast({ title: dict.toastError, description: dict.nukeCard.errorToast, variant: 'destructive' });
    } finally {
      setIsNuking(false);
      setNukeDialogOpen(false);
    }
  };

  if (authLoading || !dict) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">{dict.accessDenied.title}</CardTitle>
                <CardDescription>{dict.accessDenied.description}</CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">{dict.pageTitle}</h1>
        <p className="text-muted-foreground">{dict.pageDescription}</p>
      </div>

      {/* Card 1: Schema Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary h-6 w-6" />
            {dict.schemaCard.title}
          </CardTitle>
          <CardDescription>
            {dict.schemaCard.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {schemaResult && (
            <div className={`p-4 rounded-md ${schemaResult.length > 0 ? 'bg-destructive/10 text-destructive' : 'bg-green-600/10 text-green-700'}`}>
              <h4 className="font-bold mb-2">{schemaResult.length > 0 ? dict.schemaCard.resultsTitle : dict.schemaCard.successTitle}</h4>
              {schemaResult.length > 0 ? (
                <ul className="list-disc list-inside text-sm">
                  {schemaResult.map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
              ) : (
                <p className="text-sm">{dict.schemaCard.successMessage}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button onClick={handleSchemaCheck} disabled={checkingSchema || applyingFix}>
            {checkingSchema ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {dict.schemaCard.checkButton}
          </Button>
          {schemaResult && schemaResult.length > 0 && (
            <Button onClick={handleApplyFix} disabled={checkingSchema || applyingFix}>
              {applyingFix ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {dict.schemaCard.fixButton}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Card 2: Reset System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="text-primary h-6 w-6" />
            {dict.resetCard.title}
          </CardTitle>
          <CardDescription>
            {dict.resetCard.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
            <AlertDialog open={isResetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">{dict.resetCard.button}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{dict.resetCard.dialog.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                       {dict.resetCard.dialog.description}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} disabled={isResetting}>
                        {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {dict.resetCard.dialog.confirm}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>

      {/* Card 3: Nuke Database */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            {dict.nukeCard.title}
          </CardTitle>
          <CardDescription>
            {dict.nukeCard.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <AlertDialog open={isNukeDialogOpen} onOpenChange={setNukeDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{dict.nukeCard.button}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{dict.nukeCard.dialog.title}</AlertDialogTitle>
                <AlertDialogDescription dangerouslySetInnerHTML={{ __html: dict.nukeCard.dialog.description }} />
              </AlertDialogHeader>
              <div className="py-2">
                <Label htmlFor="nuke-confirm">{dict.nukeCard.dialog.confirmLabel}</Label>
                <Input
                  id="nuke-confirm"
                  value={nukeConfirmation}
                  onChange={(e) => setNukeConfirmation(e.target.value)}
                  placeholder={dict.nukeCard.dialog.confirmPlaceholder}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setNukeConfirmation('')}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleNuke}
                  disabled={isNuking || nukeConfirmation !== 'DELETE'}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isNuking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {dict.nukeCard.dialog.confirmAction}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
