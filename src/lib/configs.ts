export const configs = {
  nodeEnv: process.env.NODE_ENV!,
  appEnv: process.env.APP_ENV || "development",
  databaseUrl: process.env.DATABASE_URL!,
  s3: {
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION || "auto",
    bucket: process.env.S3_BUCKET!,
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
    publicUrl: process.env.S3_PUBLIC_URL, // Optional: for custom CDN URL
  },
};
