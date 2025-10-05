"use server";

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: 'https://s3.tebi.io',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Allow only images and PDF
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
  'image/bmp',
  'image/tiff',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'tif', 'tiff', 'pdf',
]);

const getExtension = (name: string) => name.split('.').pop()?.toLowerCase() || '';

export async function getS3UploadUrl(fileName: string, fileType: string) {
  try {
    if (!fileName || !fileType) {
      return { success: false, error: 'Missing fileName or fileType' };
    }

    // Validate type and extension (only images and PDF allowed)
    const ext = getExtension(fileName);
    if (!ALLOWED_MIME_TYPES.has(fileType) || !ALLOWED_EXTENSIONS.has(ext)) {
      return { success: false, error: 'Only image and PDF files are allowed.' };
    }

    // Generate a unique key for the file
    const key = `uploads/${Date.now()}-${fileName}`;

    // Create the command to put the object in the bucket
    const putObjectCommand = new PutObjectCommand({
      Bucket: 'openwave',
      Key: key,
      ContentType: fileType,
    });

    // Generate a pre-signed URL for uploading
    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 });

    // Generate the URL for accessing the file after upload
    const fileUrl = `https://s3.tebi.io/openwave/${key}`;

    return {
      success: true,
      uploadUrl,
      fileUrl,
    };
  } catch (error) {
    console.error('Error generating S3 upload URL:', error);
    return { success: false, error: 'Failed to generate upload URL' };
  }
}

export async function getS3DownloadUrl(key: string) {
  try {
    if (!key) {
      return { success: false, error: 'Missing file key' };
    }

    const command = new GetObjectCommand({
      Bucket: 'openwave',
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      success: true,
      downloadUrl,
    };
  } catch (error) {
    console.error('Error generating S3 download URL:', error);
    return { success: false, error: 'Failed to generate download URL' };
  }
}