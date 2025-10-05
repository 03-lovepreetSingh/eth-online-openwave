'use client';
import { UploadIcon, CheckCircle, AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { DropEvent, DropzoneOptions, FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DropzoneContextType = {
  src?: File[];
  accept?: DropzoneOptions['accept'];
  maxSize?: DropzoneOptions['maxSize'];
  minSize?: DropzoneOptions['minSize'];
  maxFiles?: DropzoneOptions['maxFiles'];
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  uploadedUrls?: string[];
};

type S3UploadProps = {
  contributorUsername: string;
  maintainerUsername: string;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
};

const renderBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)}${units[unitIndex]}`;
};

const DropzoneContext = createContext<DropzoneContextType | undefined>(
  undefined
);

export type DropzoneProps = Omit<DropzoneOptions, 'onDrop'> & {
  src?: File[];
  className?: string;
  onDrop?: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void;
  children?: ReactNode;
  s3Upload?: S3UploadProps;
};

const uploadToS3 = async (file: File, contributorUsername: string, maintainerUsername: string) => {
  try {
    // Get signed URL from our API
    const response = await fetch('/api/s3chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        contributorUsername,
        maintainerUsername,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get upload URL');
    }

    const { signedUrl, publicUrl } = await response.json();

    // Upload file to S3
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    return publicUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

export const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  s3Upload,
  ...props
}: DropzoneProps) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleDrop = async (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
    if (fileRejections.length > 0) {
      const message = fileRejections.at(0)?.errors.at(0)?.message;
      onError?.(new Error(message));
      return;
    }

    // If S3 upload is configured, upload files
    if (s3Upload && acceptedFiles.length > 0) {
      setUploadStatus('uploading');
      try {
        const uploadPromises = acceptedFiles.map(file => 
          uploadToS3(file, s3Upload.contributorUsername, s3Upload.maintainerUsername)
        );
        
        const urls = await Promise.all(uploadPromises);
        setUploadedUrls(urls);
        setUploadStatus('success');
        s3Upload.onUploadComplete?.(urls);
      } catch (error) {
        setUploadStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        s3Upload.onUploadError?.(errorMessage);
        onError?.(new Error(errorMessage));
      }
    }

    onDrop?.(acceptedFiles, fileRejections, event);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onError,
    disabled: disabled || uploadStatus === 'uploading',
    onDrop: handleDrop,
    ...props,
  });

  return (
    <DropzoneContext.Provider
      key={JSON.stringify(src)}
      value={{ src, accept, maxSize, minSize, maxFiles, uploadStatus, uploadedUrls }}
    >
      <Button
        className={cn(
          'relative h-auto w-full flex-col overU2U-hidden p-8',
          isDragActive && 'outline-none ring-1 ring-ring',
          uploadStatus === 'success' && 'border-green-500 bg-green-50',
          uploadStatus === 'error' && 'border-red-500 bg-red-50',
          className
        )}
        disabled={disabled || uploadStatus === 'uploading'}
        type="button"
        variant="outline"
        {...getRootProps()}
      >
        <input {...getInputProps()} disabled={disabled || uploadStatus === 'uploading'} />
        {children}
      </Button>
    </DropzoneContext.Provider>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone');
  }
  return context;
};

export type DropzoneContentProps = {
  children?: ReactNode;
  className?: string;
};

const maxLabelItems = 3;

export const DropzoneContent = ({
  children,
  className,
}: DropzoneContentProps) => {
  const { src, uploadStatus } = useDropzoneContext();
  
  if (!src) {
    return null;
  }
  
  if (children) {
    return children;
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <UploadIcon size={16} />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading to S3...';
      case 'success':
        return 'Upload successful!';
      case 'error':
        return 'Upload failed';
      default:
        return 'Drag and drop or click to replace';
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {getStatusIcon()}
      </div>
      <p className="my-2 w-full truncate font-medium text-sm">
        {src.length > maxLabelItems
          ? `${new Intl.ListFormat('en').format(
              src.slice(0, maxLabelItems).map((file) => file.name)
            )} and ${src.length - maxLabelItems} more`
          : new Intl.ListFormat('en').format(src.map((file) => file.name))}
      </p>
      <p className="w-full text-wrap text-muted-foreground text-xs">
        {getStatusText()}
      </p>
    </div>
  );
};

export type DropzoneEmptyStateProps = {
  children?: ReactNode;
  className?: string;
};

export const DropzoneEmptyState = ({
  children,
  className,
}: DropzoneEmptyStateProps) => {
  const { src, accept, maxSize, minSize, maxFiles, uploadStatus } = useDropzoneContext();
  
  if (src) {
    return null;
  }
  
  if (children) {
    return children;
  }
  
  let caption = '';
  if (accept) {
    caption += 'Accepts ';
    caption += new Intl.ListFormat('en').format(Object.keys(accept));
  }
  if (minSize && maxSize) {
    caption += ` between ${renderBytes(minSize)} and ${renderBytes(maxSize)}`;
  } else if (minSize) {
    caption += ` at least ${renderBytes(minSize)}`;
  } else if (maxSize) {
    caption += ` less than ${renderBytes(maxSize)}`;
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <UploadIcon size={16} />;
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {getStatusIcon()}
      </div>
      <p className="my-2 w-full truncate text-wrap font-medium text-sm">
        Upload {maxFiles === 1 ? 'a file' : 'files'}
      </p>
      <p className="w-full truncate text-wrap text-muted-foreground text-xs">
        {uploadStatus === 'uploading' ? 'Uploading...' : 'Drag and drop or click to upload'}
      </p>
      {caption && (
        <p className="text-wrap text-muted-foreground text-xs">{caption}.</p>
      )}
    </div>
  );
};