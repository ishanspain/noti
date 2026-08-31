process.loadEnvFile(".env")
import { S3Client } from "@aws-sdk/client-s3";

export const b2Client = new S3Client({
  endpoint: process.env.BB_ENDPOINT!,
  region: process.env.BB_REGION!,
  credentials: {
    accessKeyId: process.env.BB_KEY_ID!,
    secretAccessKey: process.env.BB_APP!,
  },
});