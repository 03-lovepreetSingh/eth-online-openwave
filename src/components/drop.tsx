'use client';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';
import { useState } from 'react';

interface ExampleProps {
  contributorID: string;
  maintainerID: string;
}

const Example = ({ contributorID, maintainerID }: ExampleProps) => {
  const [files, setFiles] = useState<File[] | undefined>();
  
  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };
  
  return (
    <Dropzone
      accept={{
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        'application/pdf': ['.pdf']
      }}
      maxFiles={5}
      maxSize={10 * 1024 * 1024} // 10MB
      onDrop={handleDrop}
      src={files}
      s3Upload={{
        contributorUsername: contributorID,
        maintainerUsername: maintainerID,
        onUploadComplete: (urls) => {
          console.log('Files uploaded successfully:', urls);
        },
        onUploadError: (error) => {
          console.error('Upload failed:', error);
        }
      }}
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
};

export default Example;
