
'use client';

import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import imageCompression from 'browser-image-compression';

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
import type { Article, Dictionary, CustomContentType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Info, ImageUp, Trash2, FileUp, File as FileIcon, Bold, Italic, Heading1, Heading2, List, Quote, Sparkles, Plus, Bot, Wand2, Pilcrow } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc, increment, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { triggerDeploy } from '@/app/dashboard/content/actions';
import { cn } from '@/lib/utils';
import { useLicense } from '@/context/LicenseContext';
import { suggestTitle } from '@/ai/flows/title-suggester-flow';
import { generateBody } from '@/ai/flows/generate-body-flow';
import { improveBody } from '@/ai/flows/improve-body-flow';
import { formatMarkdown } from '@/ai/flows/format-markdown-flow';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { setDoc } from 'firebase/firestore';


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
  dict: Dictionary;
};

export function ContentForm({ article, dict }: ContentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [customTypes, setCustomTypes] = useState<CustomContentType[]>([]);

  // AI State
  const { plan, licenseKey, licenseUid } = useLicense();
  const isAiPro = plan === 'ai_pro';
  const isAiEnabled = plan === 'pro' || isAiPro;
  
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [titleUserContext, setTitleUserContext] = useState('');
  const [titlePopoverOpen, setTitlePopoverOpen] = useState(false);

  // AI State for Body
  const [isGeneratingBody, setIsGeneratingBody] = useState(false);
  const [isImprovingBody, setIsImprovingBody] = useState(false);
  const [isFormattingMarkdown, setIsFormattingMarkdown] = useState(false);
  const [bodyUserContext, setBodyUserContext] = useState('');
  const [bodyPopoverOpen, setBodyPopoverOpen] = useState(false);

  // Featured Image
  const [imagePreview, setImagePreview] = useState<string | null>(article?.imageUrl || null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(article?.imageUrl || null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Additional Image 1
  const [imagePreview1, setImagePreview1] = useState<string | null>(article?.imageUrl1 || null);
  const [finalImageUrl1, setFinalImageUrl1] = useState<string | null>(article?.imageUrl1 || null);
  const [uploadProgress1, setUploadProgress1] = useState<number | null>(null);
  const [isUploadingImage1, setIsUploadingImage1] = useState(false);

  // Additional Image 2
  const [imagePreview2, setImagePreview2] = useState<string | null>(article?.imageUrl2 || null);
  const [finalImageUrl2, setFinalImageUrl2] = useState<string | null>(article?.imageUrl2 || null);
  const [uploadProgress2, setUploadProgress2] = useState<number | null>(null);
  const [isUploadingImage2, setIsUploadingImage2] = useState(false);
  
  // File Attachment
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(article?.fileName || null);
  const [finalFileUrl, setFinalFileUrl] = useState<string | null>(article?.fileUrl || null);
  const [uploadProgressFile, setUploadProgressFile] = useState<number | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const isRedactorJr = user?.role === 'Redactor Jr.';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article?.title || '',
      body: article?.body || '',
      status: article ? article.status === 'draft' : true,
      articleType: (article?.articleType === 'other' && article?.otherArticleType) ? article.otherArticleType : (article?.articleType || ''),
      otherType: article?.otherArticleType || '',
      categories: article?.categories?.join(', ') || '',
    },
  });
  
  const titleValue = form.watch('title');
  const bodyValue = form.watch('body');
  const articleTypeValue = form.watch('articleType');

  useEffect(() => {
    async function fetchCustomTypes() {
      try {
        const customTypesCol = collection(db, 'customContentTypes');
        const q = await getDocs(query(customTypesCol, orderBy('name')));
        const fetchedTypes = q.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CustomContentType));
        setCustomTypes(fetchedTypes);
      } catch (error) {
        console.error("Failed to fetch custom content types:", error);
      }
    }
    fetchCustomTypes();
  }, []);

  // --- AI Button Disabled States ---
  const isSuggestTitleDisabled = !isAiEnabled || titleValue.length < 20 || isSuggestingTitle;
  const isBodyAiLoading = isGeneratingBody || isImprovingBody || isFormattingMarkdown;
  const isGenerateBodyDisabled = !isAiEnabled || !titleValue || isBodyAiLoading;
  const isImproveBodyDisabled = !isAiEnabled || bodyValue.length < 60 || isBodyAiLoading;
  const isFormatMarkdownDisabled = !isAiEnabled || bodyValue.length < 60 || isBodyAiLoading;
  const isContextPopoverDisabled = !isAiEnabled || isBodyAiLoading;

  const callAiProxy = async (prompt: string): Promise<string | null> => {
    if (!licenseKey || !licenseUid) {
        toast({ title: 'Error de Licencia', description: 'No se encontró la clave de licencia o el UID para la llamada a la IA.', variant: 'destructive' });
        return null;
    }
    try {
        const response = await fetch('https://keys.admin.rtsi.site/api/ai/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: licenseKey, uid: licenseUid, prompt }),
        });
        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error || 'La llamada a la API del proxy falló');
        }

        if (plan === 'ai_pro' && data.usage && data.usage.totalTokens > 0) {
            const tokenRef = doc(db, 'tokenUsage', licenseKey);
            await setDoc(tokenRef, {
                totalTokens: increment(data.usage.totalTokens),
                lastUpdated: serverTimestamp()
            }, { merge: true });
        }
        
        if (data.response) {
            return data.response;
        }
        throw new Error('No se recibió respuesta del proxy de IA.');
    } catch (error) {
        console.error('Llamada al Proxy de IA Fallida:', error);
        toast({ title: dict.contentForm.aiError, description: (error as Error).message, variant: 'destructive' });
        return null;
    }
  };

  const handleSuggestTitle = async () => {
    if (isSuggestTitleDisabled) return;

    const currentTitle = form.getValues('title');
    setIsSuggestingTitle(true);
    
    try {
      if (isAiPro) {
        const prompt = `You are an expert SEO copywriter. Your task is to take a draft title for an article and make it better. The improved title should be catchy, engaging, and optimized for search engines. First, detect the language of the "Original Title". Your response must be in the same language. ${titleUserContext ? `Consider these keywords for context: "${titleUserContext}"` : ''} Based on this, improve the following title. Return only the improved title text, without any quotes or extra formatting. Original Title: "${currentTitle}"`;
        const result = await callAiProxy(prompt);
        if (result) {
            form.setValue('title', result.replace(/"/g, '').trim(), { shouldValidate: true, shouldDirty: true });
            toast({ title: dict.contentForm.aiSuccess });
        }
      } else { // Pro plan using local Genkit
        const result = await suggestTitle(currentTitle, titleUserContext);
        if (result?.suggestedTitle) {
          form.setValue('title', result.suggestedTitle, { shouldValidate: true, shouldDirty: true });
          toast({
            title: dict.contentForm.aiSuccess,
            description: dict.contentForm.aiSuccessDescription,
          });
        } else {
          throw new Error('No suggestion returned.');
        }
      }
    } catch (error) {
      console.error('AI Title Suggestion Failed:', error);
      toast({
        title: dict.contentForm.aiError,
        description: (error as Error).message || dict.contentForm.aiErrorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsSuggestingTitle(false);
      setTitleUserContext('');
      setTitlePopoverOpen(false);
    }
  };

  const handleGenerateBody = async () => {
    if (isGenerateBodyDisabled) return;
    setIsGeneratingBody(true);
    try {
      if (isAiPro) {
        const prompt = `You are an expert content writer and SEO specialist. Your task is to write a compelling, well-structured, and engaging article body based on the provided title. First, detect the language of the "Title". Your response MUST be in the same language. The article should be formatted using Markdown for readability (headings, lists, bold text, etc.). ${bodyUserContext ? `Consider these keywords for context: "${bodyUserContext}"` : ''} Title: "${titleValue}"`;
        const result = await callAiProxy(prompt);
        if (result) {
          form.setValue('body', result, { shouldValidate: true, shouldDirty: true });
          toast({ title: dict.contentForm.aiBodySuccess });
        }
      } else {
        const result = await generateBody({ title: titleValue, userContext: bodyUserContext });
        if (result?.body) {
          form.setValue('body', result.body, { shouldValidate: true, shouldDirty: true });
          toast({ title: dict.contentForm.aiBodySuccess, description: dict.contentForm.aiBodySuccessDescription });
        } else { throw new Error('No body returned.'); }
      }
    } catch (error) {
      console.error('AI Body Generation Failed:', error);
      toast({ title: dict.contentForm.aiBodyError, description: (error as Error).message || dict.contentForm.aiBodyErrorDescription, variant: 'destructive' });
    } finally {
      setIsGeneratingBody(false);
      setBodyUserContext('');
      setBodyPopoverOpen(false);
    }
  };
  
  const handleImproveBody = async () => {
    if (isImproveBodyDisabled) return;
    setIsImprovingBody(true);
    try {
      if (isAiPro) {
        const prompt = `You are an expert copy editor. Your task is to take an existing article body and improve it. Make it more engaging, clear, and well-structured. Correct any grammatical errors or awkward phrasing, but preserve the original intent, information, and Markdown formatting. First, detect the language of the original text. Your improved version MUST be in the same language. ${bodyUserContext ? `Consider these keywords for context: "${bodyUserContext}"` : ''} Original Text: --- ${bodyValue} ---`;
        const result = await callAiProxy(prompt);
        if (result) {
            form.setValue('body', result, { shouldValidate: true, shouldDirty: true });
            toast({ title: dict.contentForm.aiBodySuccess });
        }
      } else {
        const result = await improveBody({ body: bodyValue, userContext: bodyUserContext });
        if (result?.improvedBody) {
          form.setValue('body', result.improvedBody, { shouldValidate: true, shouldDirty: true });
          toast({ title: dict.contentForm.aiBodySuccess, description: dict.contentForm.aiBodySuccessDescription });
        } else { throw new Error('No improvement returned.'); }
      }
    } catch (error) {
      console.error('AI Body Improvement Failed:', error);
      toast({ title: dict.contentForm.aiBodyError, description: (error as Error).message || dict.contentForm.aiBodyErrorDescription, variant: 'destructive' });
    } finally {
      setIsImprovingBody(false);
      setBodyUserContext('');
      setBodyPopoverOpen(false);
    }
  };

  const handleFormatMarkdown = async () => {
    if (isFormatMarkdownDisabled) return;
    setIsFormattingMarkdown(true);
    try {
      if (isAiPro) {
        const prompt = `You are a text formatting expert. Your task is to take a piece of text and add appropriate Markdown formatting to improve its readability and structure. Add headings (#, ##), bold (**), italics (*), bulleted lists (-), and blockquotes (>). Do NOT change the original wording, content, or language. Simply apply Markdown formatting to the existing text. Original Text: --- ${bodyValue} ---`;
        const result = await callAiProxy(prompt);
        if (result) {
            form.setValue('body', result, { shouldValidate: true, shouldDirty: true });
            toast({ title: dict.contentForm.aiBodySuccess });
        }
      } else {
        const result = await formatMarkdown({ body: bodyValue });
        if (result?.formattedBody) {
          form.setValue('body', result.formattedBody, { shouldValidate: true, shouldDirty: true });
          toast({ title: dict.contentForm.aiBodySuccess, description: dict.contentForm.aiBodySuccessDescription });
        } else { throw new Error('No formatted body returned.'); }
      }
    } catch (error) {
      console.error('AI Markdown Formatting Failed:', error);
      toast({ title: dict.contentForm.aiBodyError, description: (error as Error).message || dict.contentForm.aiBodyErrorDescription, variant: 'destructive' });
    } finally {
      setIsFormattingMarkdown(false);
    }
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
              progressSetter(null);
            }
        );
    });
  };

  const startImageUpload = async (file: File, uploader: 'main' | '1' | '2') => {
    if (!file) return;

    let previewSetter, finalUrlSetter, progressSetter, uploadingSetter, originalUrl;
    switch (uploader) {
        case '1':
            [previewSetter, finalUrlSetter, progressSetter, uploadingSetter, originalUrl] = [setImagePreview1, setFinalImageUrl1, setUploadProgress1, setIsUploadingImage1, article?.imageUrl1];
            break;
        case '2':
            [previewSetter, finalUrlSetter, progressSetter, uploadingSetter, originalUrl] = [setImagePreview2, setFinalImageUrl2, setUploadProgress2, setIsUploadingImage2, article?.imageUrl2];
            break;
        default:
            [previewSetter, finalUrlSetter, progressSetter, uploadingSetter, originalUrl] = [setImagePreview, setFinalImageUrl, setUploadProgress, setIsUploadingImage, article?.imageUrl];
            break;
    }

    uploadingSetter(true);
    const tempPreviewUrl = URL.createObjectURL(file);
    previewSetter(tempPreviewUrl);
    finalUrlSetter(null);

    toast({
      title: dict.contentForm.optimizingImageTitle,
      description: dict.contentForm.optimizingImageDescription,
    });

    try {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.95,
      };

      const compressedBlob = await imageCompression(file, options);
      const newFileName = file.name.replace(/\.[^/.]+$/, ".webp");
      const compressedFile = new File([compressedBlob], newFileName, { type: "image/webp" });

      URL.revokeObjectURL(tempPreviewUrl);
      previewSetter(URL.createObjectURL(compressedFile));

      const { url } = await uploadAsset(compressedFile, progressSetter);
      finalUrlSetter(url);

      toast({ 
          title: dict.contentForm.uploadSuccessTitle,
          description: dict.contentForm.uploadSuccessDescription,
      });

    } catch (error) {
      console.error('Image processing or upload failed:', error);
      toast({
        title: dict.contentForm.optimizationErrorTitle,
        description: dict.contentForm.optimizationErrorDescription,
        variant: 'destructive',
      });
      previewSetter(originalUrl || null);
      URL.revokeObjectURL(tempPreviewUrl);
    } finally {
      uploadingSetter(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, uploader: 'main' | '1' | '2') => {
    if (e.target.files && e.target.files.length > 0) {
      startImageUpload(e.target.files[0], uploader);
    }
  };

  const startFileUpload = async (file: File) => {
    if (!file) return;
    setFile(file);
    setFileName(file.name);
    setIsUploadingFile(true);
    setFinalFileUrl(null);

    try {
        const { url } = await uploadAsset(file, setUploadProgressFile);
        setFinalFileUrl(url);
        toast({ title: 'File uploaded!' });
    } catch (error) {
        toast({ title: 'Upload failed', variant: 'destructive' });
        setFile(null);
        setFileName(article?.fileName || null);
    } finally {
        setIsUploadingFile(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        startFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, uploader: 'main' | '1' | '2' | 'file') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (uploader === 'file') {
        startFileUpload(droppedFile);
      } else {
        if (!droppedFile.type.startsWith('image/')) {
            toast({
                title: 'Archivo no válido',
                description: 'Por favor, suelta un archivo de imagen.',
                variant: 'destructive',
            });
            return;
        }
        startImageUpload(droppedFile, uploader as 'main' | '1' | '2');
      }
    }
  };

  const handleImageDelete = (uploader: 'main' | '1' | '2') => {
    switch (uploader) {
        case '1':
            setImagePreview1(null); setFinalImageUrl1(null);
            break;
        case '2':
            setImagePreview2(null); setFinalImageUrl2(null);
            break;
        default:
            setImagePreview(null); setFinalImageUrl(null);
            break;
    }
  };
  
  const handleFileDelete = () => {
    setFile(null);
    setFileName(null);
    setFinalFileUrl(null);
  };

  const copyMarkdownToClipboard = (url: string | null) => {
    if (!url) return;
    const markdown = `![Imagen](${url})`;
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: dict.contentForm.copySuccessTitle,
        description: dict.contentForm.copySuccessDescription,
      });
    });
  };

  const copyFileMarkdownToClipboard = (url: string | null, name: string | null) => {
    if (!url || !name) return;
    const markdown = `[${name}](${url})`;
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: dict.contentForm.copySuccessTitle,
        description: dict.contentForm.copySuccessDescription,
      });
    });
  };
  
  const handleMarkdownInsert = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(end);

    const newText = `${textBefore}${prefix}${selectedText}${suffix}${textAfter}`;
    form.setValue('body', newText, { shouldDirty: true, shouldValidate: true });
    
    setTimeout(() => {
        textarea.focus();
        if (selectedText) {
            textarea.selectionStart = start + prefix.length;
            textarea.selectionEnd = start + prefix.length + selectedText.length;
        } else {
            textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
        }
    }, 0);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to save an article.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const standardTypes = ['blog', 'resource', 'video'];
      const isStandardType = standardTypes.includes(values.articleType);
      const isNewCustomType = values.articleType === 'other';

      let finalArticleTypeForDb = '';
      let finalOtherArticleTypeForDb = '';

      if (isStandardType) {
          finalArticleTypeForDb = values.articleType;
      } else if (isNewCustomType) {
          finalArticleTypeForDb = 'other';
          finalOtherArticleTypeForDb = values.otherType?.trim() || '';

          if (finalOtherArticleTypeForDb) {
              const trimmedType = finalOtherArticleTypeForDb;
              const customTypesCol = collection(db, 'customContentTypes');
              const q = query(customTypesCol, where("name", "==", trimmedType));
              const existing = await getDocs(q);
              if (existing.empty) {
                  await addDoc(customTypesCol, {
                      name: trimmedType,
                      createdAt: serverTimestamp()
                  });
              }
          }
      } else { // It's a pre-existing custom type
          finalArticleTypeForDb = 'other';
          finalOtherArticleTypeForDb = values.articleType;
      }

      const categoriesArray = values.categories
        ? values.categories.split(',').map(cat => cat.trim()).filter(Boolean)
        : [];

      const finalData: Partial<Article> = {
        title: values.title,
        body: values.body,
        status: isRedactorJr ? 'draft' : (values.status ? 'draft' : 'published'),
        authorEmail: user.email,
        authorId: user.uid,
        updatedAt: serverTimestamp(),
        imageUrl: finalImageUrl || '',
        imageUrl1: finalImageUrl1 || '',
        imageUrl2: finalImageUrl2 || '',
        fileUrl: finalFileUrl || '',
        fileName: fileName || '',
        articleType: finalArticleTypeForDb,
        otherArticleType: finalOtherArticleTypeForDb,
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

      toast({ title: 'Success!', description: dict.contentForm.success });
      router.push(`/dashboard/content`);
      router.refresh();

      if (finalData.status === 'published') {
        const configRef = doc(db, 'siteConfig', 'default-site');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists() && configSnap.data().deployHookUrl) {
          const deployHookUrl = configSnap.data().deployHookUrl;
          
          setTimeout(async () => {
            const result = await triggerDeploy(deployHookUrl);
            if (result.success) {
              toast({
                title: dict.siteSettings.successTitle,
                description: dict.siteSettings.deployHookTriggered,
              });
            } else {
              toast({
                title: 'Error',
                description: dict.siteSettings.deployHookError,
                variant: 'destructive',
              });
            }
          }, 1000); // 1 second delay
        }
      }
      
    } catch (error) {
      console.error('--- FIREBASE SAVE FAILED ---', error);
      toast({ title: 'Error', description: dict.contentForm.error, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderImageUploader = (
    label: string,
    description: string,
    tooltip: string,
    imagePreview: string | null,
    finalImageUrl: string | null,
    uploadProgress: number | null,
    isUploading: boolean,
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleImageDelete: () => void,
    handleDrop: (e: React.DragEvent<HTMLLabelElement>) => void,
  ) => (
    <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormDescription>{description}</FormDescription>
        <div className="pt-2">
            {!imagePreview ? (
                <FormControl>
                    <label 
                        className={cn(
                            "relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                            dragActive && "border-primary bg-primary/10"
                        )}
                        onDrop={handleDrop}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageUp className="w-8 h-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">{dict.contentForm.uploadCTA}</p>
                        </div>
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" disabled={isUploading} />
                    </label>
                </FormControl>
            ) : (
                <div className="flex items-start gap-4">
                    <Image src={imagePreview} alt="Vista previa" width={64} height={64} className="rounded-md object-cover aspect-square border" />
                    <div className="flex-grow space-y-2">
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => copyMarkdownToClipboard(finalImageUrl)} disabled={!finalImageUrl || isUploading}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{tooltip}</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={handleImageDelete} disabled={isUploading}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{dict.contentForm.deleteImageTooltip}</p></TooltipContent>
                            </Tooltip>
                        </div>
                        {isUploading && <Progress value={uploadProgress} className="w-full max-w-xs" />}
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
    finalFileUrl: string | null,
    uploadProgress: number | null,
    isUploading: boolean,
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleFileDelete: () => void,
    handleDrop: (e: React.DragEvent<HTMLLabelElement>) => void,
  ) => (
    <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormDescription>{description}</FormDescription>
        <div className="pt-2">
            {!fileName ? (
                <FormControl>
                    <label 
                        className={cn(
                            "relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                            dragActive && "border-primary bg-primary/10"
                        )}
                        onDrop={handleDrop}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">{dict.contentForm.uploadCTA}</p>
                        </div>
                        <Input type="file" onChange={handleFileChange} className="sr-only" disabled={isUploading} />
                    </label>
                </FormControl>
            ) : (
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted">
                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-grow space-y-2 overflow-hidden">
                        <p className="text-sm font-medium break-words">{fileName}</p>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => copyFileMarkdownToClipboard(finalFileUrl, fileName)} disabled={!finalFileUrl || isUploading}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{dict.contentForm.copyFileMarkdownTooltip}</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={handleFileDelete} disabled={isUploading}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{dict.contentForm.deleteFileTooltip}</p></TooltipContent>
                            </Tooltip>
                        </div>
                        {isUploading && <Progress value={uploadProgress} className="w-full max-w-xs" />}
                    </div>
                </div>
            )}
        </div>
    </FormItem>
  );

  const anyUploadInProgress = isUploadingImage || isUploadingImage1 || isUploadingImage2 || isUploadingFile || isBodyAiLoading;

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">{article ? dict.contentForm.editTitle : dict.contentForm.createTitle}</CardTitle>
        </CardHeader>
        <CardContent>
            <TooltipProvider>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <FormLabel>{dict.contentForm.titleLabel}</FormLabel>
                              {isMobile ? (
                                  <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                          <AlertDialogHeader>
                                              <AlertDialogTitle>{dict.contentForm.infoDialogTitle}</AlertDialogTitle>
                                              <AlertDialogDescription>{dict.contentForm.titleTooltip}</AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                              <AlertDialogCancel>{dict.contentForm.infoDialogClose}</AlertDialogCancel>
                                          </AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>
                              ) : (
                                  <Tooltip>
                                      <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                      <TooltipContent><p>{dict.contentForm.titleTooltip}</p></TooltipContent>
                                  </Tooltip>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FormControl>
                              <Input 
                                  placeholder={dict.contentForm.titlePlaceholder} 
                                  {...field}
                              />
                          </FormControl>
                          <Popover open={titlePopoverOpen} onOpenChange={setTitlePopoverOpen}>
                              <PopoverTrigger asChild>
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                                      disabled={!isAiEnabled}
                                      aria-label="Add Context"
                                  >
                                      <Plus className="h-4 w-4" />
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                  <div className="grid gap-4">
                                      <div className="space-y-2">
                                          <h4 className="font-medium leading-none">{dict.contentForm.aiContextPopover.title}</h4>
                                          <p className="text-sm text-muted-foreground">
                                              {dict.contentForm.aiContextPopover.description}
                                          </p>
                                      </div>
                                      <div className="grid gap-2">
                                          <Input
                                              id="context"
                                              placeholder={dict.contentForm.aiContextPopover.placeholder}
                                              value={titleUserContext}
                                              onChange={(e) => {
                                                  const words = e.target.value.split(' ').filter(Boolean);
                                                  if (words.length <= 5) {
                                                      setTitleUserContext(e.target.value);
                                                  }
                                              }}
                                          />
                                      </div>
                                      <Button onClick={() => setTitlePopoverOpen(false)}>{dict.contentForm.aiContextPopover.closeButton}</Button>
                                  </div>
                              </PopoverContent>
                          </Popover>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="default"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 shrink-0",
                                        isSuggestTitleDisabled && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={() => {
                                        if (isSuggestTitleDisabled) return;
                                        handleSuggestTitle();
                                    }}
                                >
                                    {isSuggestingTitle ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status" />
                                    ) : (
                                        <Sparkles className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {!isAiEnabled
                                    ? dict.contentForm.aiSuggestTitleTooltipCommunity
                                    : titleValue.length < 20 
                                    ? dict.contentForm.aiTitleTooShort
                                    : dict.contentForm.aiProSuggestTitleTooltip}
                                </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
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
                          <FormLabel>{dict.contentForm.articleTypeLabel}</FormLabel>
                          {isMobile ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>{dict.contentForm.infoDialogTitle}</AlertDialogTitle>
                                      <AlertDialogDescription>{dict.contentForm.articleTypeTooltip}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>{dict.contentForm.infoDialogClose}</AlertDialogCancel>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Tooltip>
                                <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent><p>{dict.contentForm.articleTypeTooltip}</p></TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={dict.contentForm.articleTypePlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="blog">{dict.contentForm.articleTypeValues.blog}</SelectItem>
                            <SelectItem value="resource">{dict.contentForm.articleTypeValues.resource}</SelectItem>
                            <SelectItem value="video">{dict.contentForm.articleTypeValues.video}</SelectItem>
                            
                            {customTypes.length > 0 && <Separator />}
                            
                            {customTypes.map(type => (
                              <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                            ))}

                            <Separator />
                            <SelectItem value="other">{dict.contentForm.articleTypeValues.other}</SelectItem>
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
                            <FormLabel>{dict.contentForm.otherTypeLabel}</FormLabel>
                            {isMobile ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{dict.contentForm.infoDialogTitle}</AlertDialogTitle>
                                            <AlertDialogDescription>{dict.contentForm.otherTypeTooltip}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{dict.contentForm.infoDialogClose}</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>{dict.contentForm.otherTypeTooltip}</p></TooltipContent>
                                </Tooltip>
                            )}
                          </div>
                          <FormControl>
                            <Input placeholder={dict.contentForm.otherTypePlaceholder} {...field} />
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
                              <FormLabel>{dict.contentForm.categoriesLabel}</FormLabel>
                              {isMobile ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{dict.contentForm.infoDialogTitle}</AlertDialogTitle>
                                            <AlertDialogDescription>{dict.contentForm.categoriesTooltip}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{dict.contentForm.infoDialogClose}</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>{dict.contentForm.categoriesTooltip}</p></TooltipContent>
                                </Tooltip>
                            )}
                          </div>
                          <FormControl>
                            <Input placeholder={dict.contentForm.categoriesPlaceholder} {...field} />
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
                            <FormLabel>{dict.contentForm.bodyLabel}</FormLabel>
                              {isMobile ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{dict.contentForm.infoDialogTitle}</AlertDialogTitle>
                                            <AlertDialogDescription>{dict.contentForm.bodyTooltip}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{dict.contentForm.infoDialogClose}</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>{dict.contentForm.bodyTooltip}</p></TooltipContent>
                                </Tooltip>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-sm font-medium text-muted-foreground">IA</span>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="icon"
                                            className={cn("h-8 w-8", isGenerateBodyDisabled && "opacity-50 cursor-not-allowed")}
                                            onClick={() => { if(isGenerateBodyDisabled) return; handleGenerateBody()}}
                                        >
                                            {isGeneratingBody ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" /> : <Bot className="h-4 w-4" />}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent><p>{!isAiEnabled ? dict.contentForm.aiUpgradeRequired : !titleValue ? dict.contentForm.aiGenerateBodyCondition : dict.contentForm.aiGenerateBodyTooltip}</p></TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="icon"
                                            className={cn("h-8 w-8", isImproveBodyDisabled && "opacity-50 cursor-not-allowed")}
                                            onClick={() => { if(isImproveBodyDisabled) return; handleImproveBody()}}
                                        >
                                            {isImprovingBody ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" /> : <Wand2 className="h-4 w-4" />}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent><p>{!isAiEnabled ? dict.contentForm.aiUpgradeRequired : bodyValue.length < 60 ? dict.contentForm.aiImproveBodyCondition : dict.contentForm.aiImproveBodyTooltip}</p></TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="icon"
                                            className={cn("h-8 w-8", isFormatMarkdownDisabled && "opacity-50 cursor-not-allowed")}
                                            onClick={() => { if(isFormatMarkdownDisabled) return; handleFormatMarkdown()}}
                                        >
                                            {isFormattingMarkdown ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" /> : <Pilcrow className="h-4 w-4" />}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent><p>{!isAiEnabled ? dict.contentForm.aiUpgradeRequired : bodyValue.length < 60 ? dict.contentForm.aiAddMarkdownCondition : dict.contentForm.aiAddMarkdownTooltip}</p></TooltipContent>
                                  </Tooltip>
                              <Popover open={bodyPopoverOpen} onOpenChange={setBodyPopoverOpen}>
                                  <PopoverTrigger asChild>
                                      <Button type="button" variant="default" size="icon" className="h-8 w-8" disabled={isContextPopoverDisabled}>
                                          <Plus className="h-4 w-4" />
                                      </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                      <div className="grid gap-4">
                                          <div className="space-y-2">
                                              <h4 className="font-medium leading-none">{dict.contentForm.aiBodyContextPopover.title}</h4>
                                              <p className="text-sm text-muted-foreground">{dict.contentForm.aiBodyContextPopover.description}</p>
                                          </div>
                                          <div className="grid gap-2">
                                              <Input
                                                  id="body-context"
                                                  placeholder={dict.contentForm.aiBodyContextPopover.placeholder}
                                                  value={bodyUserContext}
                                                  onChange={(e) => {
                                                      const words = e.target.value.split(' ').filter(Boolean);
                                                      if (words.length <= 5) { setBodyUserContext(e.target.value); }
                                                  }}
                                              />
                                          </div>
                                          <Button onClick={() => setBodyPopoverOpen(false)}>{dict.contentForm.aiBodyContextPopover.closeButton}</Button>
                                      </div>
                                  </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <Tabs defaultValue="write" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="write">{dict.contentForm.write}</TabsTrigger>
                                  <TabsTrigger value="preview">{dict.contentForm.preview}</TabsTrigger>
                              </TabsList>
                              <TabsContent value="write">
                                  <div className="flex items-center gap-1 rounded-t-md border border-input border-b-0 p-1 bg-transparent">
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMarkdownInsert('# ', '')}>
                                                  <Heading1 className="h-4 w-4" />
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{dict.contentForm.markdownToolbar.h1}</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMarkdownInsert('## ', '')}>
                                                  <Heading2 className="h-4 w-4" />
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{dict.contentForm.markdownToolbar.h2}</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMarkdownInsert('**', '**')}>
                                                  <Bold className="h-4 w-4" />
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{dict.contentForm.markdownToolbar.bold}</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMarkdownInsert('*', '*')}>
                                                  <Italic className="h-4 w-4" />
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{dict.contentForm.markdownToolbar.italic}</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMarkdownInsert('- ', '')}>
                                                  <List className="h-4 w-4" />
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{dict.contentForm.markdownToolbar.list}</p></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMarkdownInsert('> ', '')}>
                                                  <Quote className="h-4 w-4" />
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{dict.contentForm.markdownToolbar.quote}</p></TooltipContent>
                                      </Tooltip>
                                  </div>
                                  <FormControl>
                                      <Textarea
                                        placeholder={dict.contentForm.bodyPlaceholder}
                                        className="min-h-[400px] resize-y font-mono rounded-t-none focus-visible:ring-offset-0 focus-visible:ring-1"
                                        {...field}
                                        ref={(e) => {
                                          field.ref(e);
                                          textareaRef.current = e;
                                        }}
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
                        dict.contentForm.featuredImageLabel,
                        dict.contentForm.featuredImageDescription,
                        dict.contentForm.featuredImageTooltip,
                        imagePreview,
                        finalImageUrl,
                        uploadProgress,
                        isUploadingImage,
                        (e) => handleImageUpload(e, 'main'),
                        () => handleImageDelete('main'),
                        (e) => handleDrop(e, 'main')
                    )}
                    
                    {renderImageUploader(
                        `${dict.contentForm.additionalImageLabel} 1`,
                        dict.contentForm.featuredImageDescription,
                        dict.contentForm.additionalImageTooltip,
                        imagePreview1,
                        finalImageUrl1,
                        uploadProgress1,
                        isUploadingImage1,
                        (e) => handleImageUpload(e, '1'),
                        () => handleImageDelete('1'),
                        (e) => handleDrop(e, '1')
                    )}

                    {renderImageUploader(
                        `${dict.contentForm.additionalImageLabel} 2`,
                        dict.contentForm.featuredImageDescription,
                        dict.contentForm.additionalImageTooltip,
                        imagePreview2,
                        finalImageUrl2,
                        uploadProgress2,
                        isUploadingImage2,
                        (e) => handleImageUpload(e, '2'),
                        () => handleImageDelete('2'),
                        (e) => handleDrop(e, '2')
                    )}

                    {renderFileUploader(
                        dict.contentForm.fileUploadLabel,
                        dict.contentForm.fileUploadDescription,
                        fileName,
                        finalFileUrl,
                        uploadProgressFile,
                        isUploadingFile,
                        handleFileUpload,
                        handleFileDelete,
                        (e) => handleDrop(e, 'file')
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
                                        {field.value ? dict.contentForm.statusValues.draft : dict.contentForm.statusValues.published}
                                    </FormLabel>
                                    {isMobile ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{dict.contentForm.infoDialogTitle}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      {isRedactorJr ? dict.contentForm.statusTooltipRedactorJr : dict.contentForm.statusTooltip}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{dict.contentForm.infoDialogClose}</AlertDialogCancel>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{isRedactorJr ? dict.contentForm.statusTooltipRedactorJr : dict.contentForm.statusTooltip}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={!field.value}
                                        onCheckedChange={(checked) => field.onChange(!checked)}
                                        disabled={isRedactorJr}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting || anyUploadInProgress}>
                    {isSubmitting || anyUploadInProgress ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
                    ) : (
                        dict.contentForm.submit
                    )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TooltipProvider>
        </CardContent>
    </Card>
  );
}
