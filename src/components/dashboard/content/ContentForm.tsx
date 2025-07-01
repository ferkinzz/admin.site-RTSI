
'use client';

import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Article, Dictionary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Info, ImageUp, Trash2, FileUp, File } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  articleType: z.string().min(1, { message: 'Por favor, selecciona un tipo de artículo.' }),
  otherType: z.string()
    .max(20, { message: "Debe tener como máximo 20 caracteres."})
    .regex(/^\S*$/, { message: "Debe ser una sola palabra."})
    .optional(),
  categories: z.string().optional(),
  body: z.string().min(10, {
    message: 'Body must be at least 10 characters.',
  }),
  status: z.boolean().default(true), // true = draft, false = published
}).refine(data => {
    if (data.articleType === 'other') {
        return !!data.otherType && data.otherType.trim().length > 0;
    }
    return true;
}, {
    message: "Por favor, especifique el tipo.",
    path: ["otherType"],
});

function generateSlug(title: string): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const datePrefix = `${month}-${day}`;

  const sanitizedTitle = title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return `${datePrefix}-${sanitizedTitle}`;
}

type ContentFormProps = {
  article?: Article;
  dict: Dictionary['contentForm'];
};

export function ContentForm({ article, dict }: ContentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [isUploading, setIsUploading] = useState(false);

  // Featured Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(article?.imageUrl || null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false);

  // Additional Image 1
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imagePreview1, setImagePreview1] = useState<string | null>(article?.imageUrl1 || null);
  const [uploadProgress1, setUploadProgress1] = useState<number | null>(null);
  const [image1Deleted, setImage1Deleted] = useState(false);

  // Additional Image 2
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(article?.imageUrl2 || null);
  const [uploadProgress2, setUploadProgress2] = useState<number | null>(null);
  const [image2Deleted, setImage2Deleted] = useState(false);

  // File Attachment
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(article?.fileName || null);
  const [fileUrl, setFileUrl] = useState<string | null>(article?.fileUrl || null);
  const [uploadProgressFile, setUploadProgressFile] = useState<number | null>(null);
  const [fileDeleted, setFileDeleted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article?.title || '',
      body: article?.body || '',
      status: article ? article.status === 'draft' : true,
      articleType: article?.articleType || '',
      otherType: article?.otherArticleType || '',
      categories: article?.categories?.join(', ') || '',
    },
  });
  
  const { isSubmitting } = useFormState({ control: form.control });
  const bodyValue = form.watch('body');
  const articleTypeValue = form.watch('articleType');

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    fileSetter: React.Dispatch<React.SetStateAction<File | null>>, 
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>, 
    deletedSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB size limit
        toast({
          title: 'Error',
          description: 'La imagen no puede pesar más de 10MB.',
          variant: 'destructive',
        });
        e.target.value = ''; // Reset file input
        return;
      }
      fileSetter(file);
      previewSetter(URL.createObjectURL(file));
      deletedSetter(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB size limit
        toast({
          title: 'Error',
          description: 'El archivo no puede pesar más de 10MB.',
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileUrl(URL.createObjectURL(selectedFile));
      setFileDeleted(false);
    }
  };

  const createDeleteHandler = (
    fileSetter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
    deletedSetter: React.Dispatch<React.SetStateAction<boolean>>,
    urlSetter?: React.Dispatch<React.SetStateAction<string | null>>
  ) => () => {
    fileSetter(null);
    previewSetter(null);
    deletedSetter(true);
    if(urlSetter) urlSetter(null);
  };

  const handleImageDelete = createDeleteHandler(setImageFile, setImagePreview, setImageDeleted);
  const handleImageDelete1 = createDeleteHandler(setImageFile1, setImagePreview1, setImage1Deleted);
  const handleImageDelete2 = createDeleteHandler(setImageFile2, setImagePreview2, setImage2Deleted);
  const handleFileDelete = createDeleteHandler(setFile, setFileName, setFileDeleted, setFileUrl);

  const copyMarkdownToClipboard = (url: string) => {
    const markdown = `![Imagen](${url})`;
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: dict.copySuccessTitle,
        description: dict.copySuccessDescription,
      });
    });
  };

  const copyFileMarkdownToClipboard = (url: string, name: string) => {
    const markdown = `[${name}](${url})`;
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: dict.copySuccessTitle,
        description: dict.copySuccessDescription,
      });
    });
  };

  const uploadAsset = (file: File, progressSetter: React.Dispatch<React.SetStateAction<number | null>>): Promise<{url: string, name: string}> => {
    return new Promise((resolve, reject) => {
        progressSetter(0);
        const storageRef = ref(storage, `articles/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              progressSetter(progress);
            },
            (error) => {
              console.error('--- FIREBASE UPLOAD FAILED ---', error);
              progressSetter(null);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({url: downloadURL, name: file.name});
            }
        );
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('--- Starting article submission ---');
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to save an article.', variant: 'destructive' });
      return;
    }
    
    setIsUploading(true);

    try {
      const uploadPromises: Promise<{ key: string; url: string; name?: string; }>[] = [];
      if (imageFile) uploadPromises.push(uploadAsset(imageFile, setUploadProgress).then(({url}) => ({ key: 'imageUrl', url })));
      if (imageFile1) uploadPromises.push(uploadAsset(imageFile1, setUploadProgress1).then(({url}) => ({ key: 'imageUrl1', url })));
      if (imageFile2) uploadPromises.push(uploadAsset(imageFile2, setUploadProgress2).then(({url}) => ({ key: 'imageUrl2', url })));
      if (file) uploadPromises.push(uploadAsset(file, setUploadProgressFile).then(({url, name}) => ({ key: 'file', url, name })));
      
      const results = await Promise.all(uploadPromises);
      const newAssetUrls: { [key: string]: string | undefined } = {};
      results.forEach(res => {
          newAssetUrls[res.key] = res.url;
          if (res.key === 'file' && res.name) {
            newAssetUrls.fileName = res.name;
          }
      });

      const categoriesArray = values.categories
        ? values.categories.split(',').map(cat => cat.trim()).filter(Boolean)
        : [];

      const finalData: Partial<Article> = {
        title: values.title,
        body: values.body,
        status: values.status ? 'draft' : 'published',
        authorEmail: user.email,
        authorId: user.uid,
        updatedAt: serverTimestamp(),
        imageUrl: imageDeleted ? '' : newAssetUrls.imageUrl || article?.imageUrl || '',
        imageUrl1: image1Deleted ? '' : newAssetUrls.imageUrl1 || article?.imageUrl1 || '',
        imageUrl2: image2Deleted ? '' : newAssetUrls.imageUrl2 || article?.imageUrl2 || '',
        fileUrl: fileDeleted ? '' : newAssetUrls.file || article?.fileUrl || '',
        fileName: fileDeleted ? '' : newAssetUrls.fileName || article?.fileName || '',
        articleType: values.articleType,
        otherArticleType: values.articleType === 'other' ? values.otherType : '',
        categories: categoriesArray,
      };

      if (article) {
        const articleRef = doc(db, 'articles', article.id!);
        const docSnap = await getDoc(articleRef);
        if (!docSnap.exists()) throw new Error('Article not found.');
        
        let slug = docSnap.data().slug;
        if (docSnap.data().title !== values.title) {
            slug = generateSlug(values.title);
        }
        
        await updateDoc(articleRef, { ...finalData, slug });
      } else {
        const slug = generateSlug(values.title);
        await addDoc(collection(db, 'articles'), {
          ...finalData,
          slug: slug,
          createdAt: serverTimestamp(),
        });
      }

      toast({ title: 'Success!', description: dict.success });
      router.push(`/dashboard/content`);
      router.refresh();
      
    } catch (error) {
      console.error('--- FIREBASE SAVE FAILED ---', error);
      toast({ title: 'Error', description: dict.error, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      setUploadProgress1(null);
      setUploadProgress2(null);
      setUploadProgressFile(null);
    }
  }

  const renderImageUploader = (
    label: string,
    description: string,
    tooltip: string,
    imagePreview: string | null,
    uploadProgress: number | null,
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleImageDelete: () => void,
  ) => (
    <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormDescription>{description}</FormDescription>
        <div className="pt-2">
            {!imagePreview ? (
                <FormControl>
                    <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageUp className="w-8 h-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">{dict.uploadCTA}</p>
                        </div>
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                    </label>
                </FormControl>
            ) : (
                <div className="flex items-start gap-4">
                    <Image src={imagePreview} alt="Vista previa" width={64} height={64} className="rounded-md object-cover aspect-square border" />
                    <div className="flex-grow space-y-2">
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => copyMarkdownToClipboard(imagePreview!)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{tooltip}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={handleImageDelete}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{dict.deleteImageTooltip}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {uploadProgress !== null && <Progress value={uploadProgress} className="w-full max-w-xs" />}
                    </div>
                </div>
            )}
        </div>
    </FormItem>
  );

  const renderFileUploader = (
    label: string,
    description: string,
    fileName: string | null,
    fileUrl: string | null,
    uploadProgress: number | null,
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleFileDelete: () => void,
  ) => (
    <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormDescription>{description}</FormDescription>
        <div className="pt-2">
            {!fileName ? (
                <FormControl>
                    <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">{dict.uploadCTA}</p>
                        </div>
                        <Input type="file" onChange={handleFileChange} className="sr-only" />
                    </label>
                </FormControl>
            ) : (
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted">
                        <File className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-grow space-y-2 overflow-hidden">
                        <p className="text-sm font-medium break-words">{fileName}</p>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => copyFileMarkdownToClipboard(fileUrl!, fileName!)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{dict.copyFileMarkdownTooltip}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={handleFileDelete}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{dict.deleteFileTooltip}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {uploadProgress !== null && <Progress value={uploadProgress} className="w-full max-w-xs" />}
                    </div>
                </div>
            )}
        </div>
    </FormItem>
  );

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">{article ? dict.editTitle : dict.createTitle}</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex items-center gap-2">
                          <FormLabel>{dict.titleLabel}</FormLabel>
                          {isMobile ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{dict.infoDialogTitle}</AlertDialogTitle>
                                        <AlertDialogDescription>{dict.titleTooltip}</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{dict.infoDialogClose}</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>{dict.titleTooltip}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                      </div>
                      <FormControl>
                        <Input placeholder={dict.titlePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="articleType"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>{dict.articleTypeLabel}</FormLabel>
                        {isMobile ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{dict.infoDialogTitle}</AlertDialogTitle>
                                    <AlertDialogDescription>{dict.articleTypeTooltip}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{dict.infoDialogClose}</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <TooltipProvider>
                              <Tooltip>
                                  <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                  <TooltipContent><p>{dict.articleTypeTooltip}</p></TooltipContent>
                              </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={dict.articleTypePlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="blog">{dict.articleTypeValues.blog}</SelectItem>
                          <SelectItem value="resource">{dict.articleTypeValues.resource}</SelectItem>
                          <SelectItem value="video">{dict.articleTypeValues.video}</SelectItem>
                          <SelectItem value="other">{dict.articleTypeValues.other}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {articleTypeValue === 'other' && (
                  <FormField
                    control={form.control}
                    name="otherType"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>{dict.otherTypeLabel}</FormLabel>
                          {isMobile ? (
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>{dict.infoDialogTitle}</AlertDialogTitle>
                                          <AlertDialogDescription>{dict.otherTypeTooltip}</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>{dict.infoDialogClose}</AlertDialogCancel>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          ) : (
                              <TooltipProvider>
                                  <Tooltip>
                                      <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                      <TooltipContent><p>{dict.otherTypeTooltip}</p></TooltipContent>
                                  </Tooltip>
                              </TooltipProvider>
                          )}
                        </div>
                        <FormControl>
                          <Input placeholder={dict.otherTypePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {articleTypeValue === 'blog' && (
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                            <FormLabel>{dict.categoriesLabel}</FormLabel>
                            {isMobile ? (
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>{dict.infoDialogTitle}</AlertDialogTitle>
                                          <AlertDialogDescription>{dict.categoriesTooltip}</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>{dict.infoDialogClose}</AlertDialogCancel>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          ) : (
                              <TooltipProvider>
                                  <Tooltip>
                                      <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                      <TooltipContent><p>{dict.categoriesTooltip}</p></TooltipContent>
                                  </Tooltip>
                              </TooltipProvider>
                          )}
                        </div>
                        <FormControl>
                          <Input placeholder={dict.categoriesPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center gap-2">
                           <FormLabel>{dict.bodyLabel}</FormLabel>
                            {isMobile ? (
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>{dict.infoDialogTitle}</AlertDialogTitle>
                                          <AlertDialogDescription>{dict.bodyTooltip}</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>{dict.infoDialogClose}</AlertDialogCancel>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          ) : (
                              <TooltipProvider>
                                  <Tooltip>
                                      <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                      <TooltipContent><p>{dict.bodyTooltip}</p></TooltipContent>
                                  </Tooltip>
                              </TooltipProvider>
                          )}
                        </div>
                        <Tabs defaultValue="write" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="write">{dict.write}</TabsTrigger>
                                <TabsTrigger value="preview">{dict.preview}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="write">
                                <FormControl>
                                    <Textarea
                                    placeholder={dict.bodyPlaceholder}
                                    className="min-h-[400px] resize-y font-mono"
                                    {...field}
                                    />
                                </FormControl>
                            </TabsContent>
                            <TabsContent value="preview">
                                <div className="h-[400px] overflow-y-auto rounded-md border bg-muted/50 p-4">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 border-b pb-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                                            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4" {...props} />,
                                            code: ({ node, inline, className, children, ...props }) => {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                <div className="bg-background rounded-md p-4 my-4 overflow-x-auto">
                                                    <code className={`font-mono text-sm ${className}`} {...props}>
                                                    {children}
                                                    </code>
                                                </div>
                                                ) : (
                                                <code className="bg-muted px-1.5 py-1 rounded-sm font-mono text-sm" {...props}>
                                                    {children}
                                                </code>
                                                );
                                            },
                                            img: ({ node, ...props }) => <img className="max-w-full my-4 rounded-md shadow-lg" {...props} alt="" />,
                                            hr: ({ node, ...props }) => <hr className="my-6" {...props} />,
                                            table: ({ node, ...props }) => <div className="overflow-x-auto"><table className="w-full my-4 border-collapse border" {...props} /></div>,
                                            thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
                                            th: ({ node, ...props }) => <th className="border p-2 font-semibold text-left" {...props} />,
                                            td: ({ node, ...props }) => <td className="border p-2" {...props} />,
                                        }}
                                    >
                                        {bodyValue || 'Preview will appear here...'}
                                    </ReactMarkdown>
                                </div>
                            </TabsContent>
                        </Tabs>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {renderImageUploader(
                      dict.featuredImageLabel,
                      dict.featuredImageDescription,
                      dict.featuredImageTooltip,
                      imagePreview,
                      uploadProgress,
                      (e) => handleImageChange(e, setImageFile, setImagePreview, setImageDeleted),
                      handleImageDelete
                  )}
                  
                  {renderImageUploader(
                      `${dict.additionalImageLabel} 1`,
                      dict.featuredImageDescription,
                      dict.additionalImageTooltip,
                      imagePreview1,
                      uploadProgress1,
                      (e) => handleImageChange(e, setImageFile1, setImagePreview1, setImage1Deleted),
                      handleImageDelete1
                  )}

                  {renderImageUploader(
                      `${dict.additionalImageLabel} 2`,
                      dict.featuredImageDescription,
                      dict.additionalImageTooltip,
                      imagePreview2,
                      uploadProgress2,
                      (e) => handleImageChange(e, setImageFile2, setImagePreview2, setImage2Deleted),
                      handleImageDelete2
                  )}

                  {renderFileUploader(
                      dict.fileUploadLabel,
                      dict.fileUploadDescription,
                      fileName,
                      fileUrl,
                      uploadProgressFile,
                      handleFileChange,
                      handleFileDelete
                  )}
                </div>
                <Separator />


                <div className="flex items-center justify-between gap-4">
                  <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                          <FormItem className="flex w-fit flex-col items-center justify-center gap-2 rounded-lg border p-3">
                              <div className="flex items-center gap-2">
                                  <FormLabel className="font-normal text-muted-foreground">
                                      {field.value ? dict.statusValues.draft : dict.statusValues.published}
                                  </FormLabel>
                                  {isMobile ? (
                                      <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                              <AlertDialogHeader>
                                                  <AlertDialogTitle>{dict.infoDialogTitle}</AlertDialogTitle>
                                                  <AlertDialogDescription>{dict.statusTooltip}</AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                  <AlertDialogCancel>{dict.infoDialogClose}</AlertDialogCancel>
                                              </AlertDialogFooter>
                                          </AlertDialogContent>
                                      </AlertDialog>
                                  ) : (
                                      <TooltipProvider>
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                  <p>{dict.statusTooltip}</p>
                                              </TooltipContent>
                                          </Tooltip>
                                      </TooltipProvider>
                                  )}
                              </div>
                              <FormControl>
                                  <Switch
                                      checked={!field.value}
                                      onCheckedChange={(checked) => field.onChange(!checked)}
                                  />
                              </FormControl>
                          </FormItem>
                      )}
                  />
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting || isUploading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
                  ) : (
                      dict.submit
                  )}
                  </Button>
                </div>
              </form>
            </Form>
        </CardContent>
    </Card>
  );
}
