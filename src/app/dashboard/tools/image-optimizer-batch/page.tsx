
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Download, Upload, Loader2, X, HardDriveUpload, Rocket, CloudUpload, Copy, Trash2, Lock } from 'lucide-react';
import { useLicense } from '@/context/LicenseContext';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 20;

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
type OptimizedImage = {
  name: string;
  originalSize: number;
  optimizedSize: number;
  optimizedFile: File;
  previewUrl: string;
};
type UploadedFile = { name: string; url: string };

export default function ImageOptimizerBatchPage() {
    const [dict, setDict] = useState<Dictionary | null>(null);
    const { plan } = useLicense();
    const { user, loading: authLoading } = useAuth();
    const isPro = plan === 'pro' || plan === 'ai_pro';
    const canDelete = user?.role === 'Admin';
    const canAccess = isPro && (user?.role === 'Admin' || user?.role === 'Redactor' || user?.role === 'Redactor Jr.');

    const [originalFiles, setOriginalFiles] = useState<File[]>([]);
    const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([]);
    
    const [quality, setQuality] = useState(80);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/webp');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');

    // New state for Storage
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [loadingPrevious, setLoadingPrevious] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        getDictionary('es').then(setDict);
    }, []);

    const fetchUploadedFiles = useCallback(async () => {
        if (!canAccess) {
            setLoadingPrevious(false);
            return;
        }
        setLoadingPrevious(true);
        const listRef = ref(storage, 'optimized-images/batch');
        try {
            const res = await listAll(listRef);
            const files = await Promise.all(
                res.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return { name: itemRef.name, url };
                })
            );
            setUploadedFiles(files.reverse());
        } catch (error) {
            console.error("Failed to fetch uploaded files:", error);
        } finally {
            setLoadingPrevious(false);
        }
    }, [canAccess]);

    useEffect(() => {
        if (canAccess) {
            fetchUploadedFiles();
        }
    }, [canAccess, user, fetchUploadedFiles]);

    const resetState = () => {
        setOriginalFiles([]);
        setOptimizedImages([]);
        setProcessingStatus('');
        setIsLoading(false);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files || files.length === 0 || !dict) return;

        const d = dict.tools.imageOptimizerBatch;

        if (files.length > MAX_FILES) {
        toast({
            variant: "destructive",
            title: d.toastTooManyFilesTitle,
            description: d.toastTooManyFilesDesc.replace('{maxFiles}', String(MAX_FILES)),
        });
        return;
        }
        
        const validFiles: File[] = [];
        for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast({
            variant: "destructive",
            title: d.toastFileTooLargeTitle,
            description: d.toastFileTooLargeDesc.replace('{fileName}', file.name).replace('{maxSize}', String(MAX_FILE_SIZE_MB)),
            });
        } else {
            validFiles.push(file);
        }
        }
        
        resetState();
        setOriginalFiles(validFiles);

    }, [toast, dict]);

    const handleOptimize = async () => {
        if (originalFiles.length === 0 || !dict) {
            toast({
                variant: "destructive",
                title: dict.tools.imageOptimizerBatch.toastNoImagesTitle,
                description: dict.tools.imageOptimizerBatch.toastNoImagesDesc,
            });
            return;
        }

        const d = dict.tools.imageOptimizerBatch;
        setIsLoading(true);
        setOptimizedImages([]);
        const newOptimizedImages: OptimizedImage[] = [];

        const options = {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: quality / 100,
            fileType: outputFormat,
            alwaysKeepResolution: false,
        };

        for (let i = 0; i < originalFiles.length; i++) {
            const file = originalFiles[i];
            setProcessingStatus(d.optimizingStatus.replace('{current}', String(i + 1)).replace('{total}', String(originalFiles.length)).replace('{fileName}', file.name));
            try {
                const compressedFile = await imageCompression(file, options);
                newOptimizedImages.push({
                    name: file.name,
                    originalSize: file.size,
                    optimizedSize: compressedFile.size,
                    optimizedFile: compressedFile,
                    previewUrl: URL.createObjectURL(compressedFile),
                });
            } catch (error) {
                console.error(`Error compressing ${file.name}:`, error);
                toast({
                    variant: "destructive",
                    title: d.toastErrorCompressingTitle.replace('{fileName}', file.name),
                    description: d.toastErrorCompressingDesc,
                });
            }
        }
        
        setOptimizedImages(newOptimizedImages);
        setProcessingStatus('');
        setIsLoading(false);
        toast({
            title: d.toastSuccessTitle,
            description: d.toastSuccessDesc.replace('{count}', String(newOptimizedImages.length)),
        });
    };
    
    const handleDownload = (image: OptimizedImage) => {
        const link = document.createElement('a');
        link.href = image.previewUrl;
        const name = image.name.split('.').slice(0, -1).join('.') || 'optimized-image';
        const extension = outputFormat.split('/')[1];
        link.download = `${name}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files);
        }
    };

    const handleUploadToStorage = async (image: OptimizedImage) => {
        if (!dict || !user) return;
        setUploadingId(image.name);
        const d = dict.tools.imageOptimizerBatch;
      
        try {
          const storageRef = ref(storage, `optimized-images/batch/${Date.now()}-${image.optimizedFile.name}`);
          await uploadBytesResumable(storageRef, image.optimizedFile);
          await fetchUploadedFiles();
          toast({ title: d.toastUploadSuccessTitle.replace('{fileName}', image.name) });
        } catch (error: any) {
          console.error(`Upload failed for ${image.name}:`, error);
          toast({
            variant: "destructive",
            title: d.toastUploadErrorTitle.replace('{fileName}', image.name),
            description: error.message,
          });
        } finally {
          setUploadingId(null);
        }
      };

    const handleDeleteFromStorage = async (fileName: string) => {
        if (!dict) return;
        const d = dict.tools.imageOptimizerBatch;
        const fileRef = ref(storage, `optimized-images/batch/${fileName}`);
        try {
            await deleteObject(fileRef);
            setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
            toast({
                title: d.toastDeleteSuccessTitle,
            });
        } catch (error: any) {
            console.error("Failed to delete file from storage:", error);
            toast({
                variant: "destructive",
                title: d.toastDeleteErrorTitle,
                description: error.code === 'storage/unauthorized' ? d.toastDeleteErrorUnauthorized : error.message,
            });
        }
    };

    const handleCopyLink = (url: string) => {
        if (!dict) return;
        navigator.clipboard.writeText(url).then(() => {
            toast({
                title: dict.tools.imageOptimizer.toastCopySuccessTitle,
                description: dict.tools.imageOptimizer.toastCopySuccessDesc,
            });
        });
      };
    
    if (authLoading || !dict) {
      return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            </div>
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-[400px] w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>
        </div>
      )
    }
  
    const { imageOptimizerBatch: d } = dict.tools;

    if (!canAccess) {
        return (
          <div className="flex items-center justify-center h-full">
              <Card className="w-full max-w-md text-center">
                  <CardHeader>
                      <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                         {!isPro ? <Rocket className="h-8 w-8 text-primary" /> : <Lock className="h-8 w-8 text-primary" />}
                      </div>
                      <CardTitle className="mt-4">{!isPro ? dict.tools.imageOptimizer.upgradeTitle : d.roleErrorTitle}</CardTitle>
                      <CardDescription>{!isPro ? dict.tools.imageOptimizer.upgradeDescription : d.roleErrorDescription}</CardDescription>
                  </CardHeader>
                  {!isPro && (
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{dict.tools.imageOptimizer.upgradeCTA}</p>
                    </CardContent>
                  )}
              </Card>
          </div>
        );
    }
    
    return (
    <div className="w-full">
        <section className="text-center mb-12">
            <div className="flex justify-center mb-4"><HardDriveUpload className="w-16 h-16 text-primary" /></div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                {d.pageTitleHtml[0]} <span className="text-primary">{d.pageTitleHtml[1]}</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {d.pageDescription}
            </p>
        </section>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-6">
                <Card 
                    className={`shadow-lg transition-all ${isDragging ? 'border-primary ring-2 ring-primary' : ''}`}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                            {d.uploadTitle}
                        </CardTitle>
                        <CardDescription>
                            {d.uploadDescription.replace('{maxFiles}', String(MAX_FILES)).replace('{maxSize}', String(MAX_FILE_SIZE_MB))}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {originalFiles.length === 0 ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                        >
                            <Upload className="w-12 h-12 text-muted-foreground mb-4"/>
                            <p className="text-muted-foreground">{d.uploadCTA}</p>
                            <Input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={(e) => handleFileSelect(e.target.files)} 
                                className="hidden" 
                                accept="image/*"
                                multiple
                            />
                        </div>
                        ) : (
                        <div className="space-y-2">
                            <h3 className="font-semibold">{d.selectedFilesTitle.replace('{count}', String(originalFiles.length))}</h3>
                            <ul className="text-sm text-muted-foreground list-disc list-inside max-h-48 overflow-y-auto">
                                {originalFiles.map(file => (
                                    <li key={file.name} className="truncate">{file.name} ({formatBytes(file.size)})</li>
                                ))}
                            </ul>
                        </div>
                        )}
                    </CardContent>
                    {originalFiles.length > 0 && (
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={resetState}><X className="mr-2 h-4 w-4"/>{d.cleanButton}</Button>
                        </CardFooter>
                    )}
                </Card>

                {isLoading && (
                    <Card className="shadow-lg">
                        <CardContent className="p-6 flex items-center gap-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <div>
                                <p className="font-semibold">{d.processing}</p>
                                <p className="text-sm text-muted-foreground">{processingStatus}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {optimizedImages.length > 0 && !isLoading && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>{d.resultsTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                            {optimizedImages.map((image, index) => (
                                <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative w-10 h-10 shrink-0">
                                            <Image src={image.previewUrl} alt={`Preview de ${image.name}`} fill className="rounded object-cover" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{image.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatBytes(image.originalSize)} &rarr;{' '}
                                                <span className="font-semibold text-primary">{formatBytes(image.optimizedSize)}</span>
                                                <span className="text-green-600 ml-2">
                                                    ({((1 - image.optimizedSize / image.originalSize) * 100).toFixed(1)}% {d.savings})
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2">
                                        <Button size="icon" variant="outline" onClick={() => handleDownload(image)}><Download className="h-4 w-4"/></Button>
                                        <Button size="icon" variant="outline" onClick={() => handleUploadToStorage(image)} disabled={uploadingId === image.name}>
                                            {uploadingId === image.name ? <Loader2 className="h-4 w-4 animate-spin"/> : <CloudUpload className="h-4 w-4"/>}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>{d.previousUploadsTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingPrevious ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : uploadedFiles.length > 0 ? (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {uploadedFiles.map((file) => (
                                    <Dialog key={file.url}>
                                        <div className="flex items-center justify-between gap-4 p-2 border rounded-md">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="relative w-10 h-10 shrink-0">
                                                    <Image src={file.url} alt={`Preview de ${file.name}`} fill className="rounded object-cover" />
                                                </div>
                                                <DialogTrigger asChild>
                                                    <button className="text-sm font-medium truncate text-left hover:underline">{file.name}</button>
                                                </DialogTrigger>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline" onClick={() => handleCopyLink(file.url)}><Copy className="h-4 w-4"/></Button>
                                                <Button size="icon" asChild>
                                                    <Link href={file.url} target="_blank" download>
                                                        <Download className="h-4 w-4"/>
                                                    </Link>
                                                </Button>
                                                {canDelete && (
                                                    <Button size="icon" variant="destructive" onClick={() => handleDeleteFromStorage(file.name)}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <DialogContent className="w-auto h-auto max-w-[90vw] max-h-[90vh] bg-transparent border-none shadow-none p-0">
                                            <Image 
                                                src={file.url} 
                                                alt={`Vista completa de ${file.name}`} 
                                                width={1920} 
                                                height={1080} 
                                                className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-md"
                                            />
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">{d.noPreviousUploads}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="shadow-lg sticky top-24">
                <CardHeader>
                    <CardTitle className="font-headline">{d.optionsTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                    <Label htmlFor="output-format">{d.outputFormatLabel}</Label>
                    <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)} disabled={isLoading}>
                        <SelectTrigger id="output-format"><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="image/webp">{d.formatWebp}</SelectItem>
                        <SelectItem value="image/jpeg">{d.formatJpeg}</SelectItem>
                        <SelectItem value="image/png">{d.formatPng}</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="quality-slider">{d.qualityLabel}: {quality}%</Label>
                    <Slider
                        id="quality-slider"
                        min={10} max={100} step={5}
                        value={[quality]}
                        onValueChange={(v) => setQuality(v[0])}
                        disabled={isLoading || outputFormat === 'image/png'}
                    />
                    <p className="text-xs text-muted-foreground">{d.qualityDescription}</p>
                    </div>
                    
                    <Button onClick={handleOptimize} disabled={originalFiles.length === 0 || isLoading} className="w-full">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {d.optimizingButton}</> : <><Sparkles className="mr-2 h-4 w-4" />{d.optimizeButton}</>}
                    </Button>
                </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

    

    