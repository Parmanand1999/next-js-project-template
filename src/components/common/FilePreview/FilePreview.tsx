/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo, useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilePreviewProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
}

export function FilePreview({ fileUrl, fileName, className = '' }: FilePreviewProps) {
  const [zoom, setZoom] = useState(1);

  const extension = useMemo(() => {
    if (!fileUrl) return '';
    return fileUrl.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
  }, [fileUrl]);

  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(extension);
  const isPdf = extension === 'pdf';

  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <FileText className="size-12 opacity-40 mb-2" />
        <p className="text-sm font-medium">No document available to preview</p>
      </div>
    );
  }

  // Image Preview with Zoom Controls
  if (isImage) {
    return (
      <div className={cn('flex flex-col items-center justify-center size-full relative bg-muted/20 rounded-xl overflow-hidden p-4', className)}>
        {/* Floating Zoom Bar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-background/90 backdrop-blur border border-border px-2 py-1 rounded-xl shadow-md">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
            className="p-1 hover:bg-muted rounded-lg text-foreground transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
          </button>
          <span className="text-xs font-mono px-1 font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.5))}
            className="p-1 hover:bg-muted rounded-lg text-foreground transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>

        <div className="overflow-auto size-full flex items-center justify-center">
          <img
            src={fileUrl}
            alt={fileName || 'Document preview'}
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease' }}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-sm"
          />
        </div>
      </div>
    );
  }

  // PDF Viewer
  if (isPdf) {
    return (
      <div className="size-full min-h-[70vh] rounded-xl overflow-hidden border border-border">
        <iframe
          src={`${fileUrl}#toolbar=1`}
          title={fileName || 'PDF Document'}
          width="100%"
          height="100%"
          className="size-full border-0 min-h-[70vh]"
        />
      </div>
    );
  }

  // Generic File / Fallback
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <FileText className="size-8" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground text-sm">
          {fileName || 'Document file'}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          Direct browser preview not supported for .{extension} files.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(fileUrl, '_blank')}
          className="gap-2"
        >
          <ExternalLink className="size-3.5" />
          Open External
        </Button>
        <a href={fileUrl} download={fileName || 'download'}>
          <Button size="sm" className="gap-2 bg-[#3456A7] hover:bg-[#274487] text-white">
            <Download className="size-3.5" />
            Download File
          </Button>
        </a>
      </div>
    </div>
  );
}

export default FilePreview;
