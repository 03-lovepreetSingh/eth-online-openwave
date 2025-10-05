import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';

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

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing fileName or fileType' },
        { status: 400 }
      );
    }

    // Validate type and extension (only images and PDF allowed)
    const ext = getExtension(fileName);
    if (!ALLOWED_MIME_TYPES.has(fileType) || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: 'Only image and PDF files are allowed.' },
        { status: 400 }
      );
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
      ACL: 'public-read'
    });

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60,
    });

    // Generate a public URL for the object
    const publicUrl = `https://s3.tebi.io/gitfund/${fileName}`;

    return NextResponse.json({ 
      signedUrl,
      publicUrl // Return the public URL as well
    });
  } catch (error) {
    console.error('Error generating S3 signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileName = searchParams.get('fileName');
        
        if (!fileName) {
            return NextResponse.json(
                { error: 'Missing fileName parameter' },
                { status: 400 }
            );
        }

        // Validate extension (only images and PDF allowed)
        const ext = getExtension(fileName);
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json(
                { error: 'Only image and PDF files are allowed.' },
                { status: 400 }
            );
        }

        const getObjectParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
        };

        // Use GetObjectCommand instead of PutObjectCommand
        const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), {
            expiresIn: 60,
        });

        // Generate a public URL for the object
        const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.tebi.io/${fileName}`;

        return NextResponse.json({ 
            signedUrl,
            publicUrl // Return the public URL as well
        });
    } catch (error) {
        console.error('Error generating S3 download URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate download URL' },
            { status: 500 }
        );
    }
}