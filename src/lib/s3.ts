import { S3Client } from "bun";
import { configs } from "./configs";

// Create S3 client using Bun's native S3 API
export const s3Client = new S3Client({
  endpoint: configs.s3.endpoint,
  bucket: configs.s3.bucket,
  accessKeyId: configs.s3.accessKeyId,
  secretAccessKey: configs.s3.secretAccessKey,
});

export const s3Config = {
  bucket: configs.s3.bucket,
  publicUrl: configs.s3.publicUrl,
};

// Generate a unique file name
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${timestamp}-${randomString}.${extension}`;
}

// Get public URL for uploaded file
export function getPublicUrl(key: string): string {
  if (s3Config.publicUrl) {
    return `${s3Config.publicUrl}/${key}`;
  }
  // Fallback to S3 endpoint URL
  return `${configs.s3.endpoint}/${s3Config.bucket}/${key}`;
}

// Generate a presigned URL for secure access to a file
export function getSignedUrl(
  key: string,
  options?: {
    expiresIn?: number; // Expiration time in seconds (default: 86400 = 24 hours)
    method?: "GET" | "PUT" | "POST" | "DELETE" | "HEAD"; // HTTP method (default: GET)
    contentType?: string; // Content type for PUT/POST requests
  },
): string {
  const file = s3Client.file(key);
  return file.presign({
    expiresIn: options?.expiresIn || 86400, // Default 24 hours
    method: options?.method,
    type: options?.contentType,
  });
}
