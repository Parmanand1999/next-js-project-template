'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { X, FileText, Download, ExternalLink } from 'lucide-react';
import { FilePreview } from './FilePreview';
import { Button } from '@/components/ui/button';

export interface FileViewerModalProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
  title?: string;
}

export function FileViewerModal({
  open,
  onClose,
  fileUrl,
  fileName,
  title = 'Document Preview',
}: FileViewerModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl h-[88vh] p-0 overflow-hidden rounded-2xl border-border bg-card shadow-2xl flex flex-col [&>button]:hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3.5 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-md">
                {fileName || fileUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fileUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="gap-1.5 h-8 text-xs"
                >
                  <ExternalLink className="size-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </Button>
                <a href={fileUrl} download={fileName || 'file'}>
                  <Button
                    size="sm"
                    className="gap-1.5 h-8 text-xs bg-[#3456A7] hover:bg-[#274487] text-white"
                  >
                    <Download className="size-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </a>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer ml-1"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-muted/10">
          <FilePreview fileUrl={fileUrl} fileName={fileName} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FileViewerModal;
