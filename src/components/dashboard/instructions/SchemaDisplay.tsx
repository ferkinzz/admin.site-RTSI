'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Dictionary } from '@/types';

type SchemaDisplayProps = {
  rawMarkdown: string;
  dict: Dictionary['instructions']['guides']['buildingYourSite'];
};

export function SchemaDisplay({ rawMarkdown, dict }: SchemaDisplayProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMarkdown).then(() => {
      toast({
        title: dict.copySuccess,
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-xl font-semibold">{dict.schemaTitle}</h3>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          {dict.copyButton}
        </Button>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/50 p-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 border-b pb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
            table: ({node, ...props}) => <div className="overflow-x-auto"><table className="w-full my-4 border-collapse" {...props} /></div>,
            thead: ({node, ...props}) => <thead className="bg-muted/50" {...props} />,
            th: ({node, ...props}) => <th className="border p-2 font-semibold text-left" {...props} />,
            td: ({node, ...props}) => <td className="border p-2" {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-200 dark:bg-gray-700 rounded-sm px-1.5 py-1 font-mono text-sm" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
          }}
        >
          {rawMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
