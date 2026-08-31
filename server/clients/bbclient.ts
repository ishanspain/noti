process.loadEnvFile(".env");
import { S3Client } from "@aws-sdk/client-s3";

const rawEndpoint = process.env.BB_ENDPOINT?.trim();
const endpoint = rawEndpoint
  ? rawEndpoint.startsWith("http://") || rawEndpoint.startsWith("https://")
    ? rawEndpoint
    : `https://${rawEndpoint}`
  : undefined;

if (!endpoint || !process.env.BB_REGION || !process.env.BB_KEY_ID || !process.env.BB_APP) {
  throw new Error(
    "Missing Backblaze config. Set BB_ENDPOINT, BB_REGION, BB_KEY_ID, and BB_APP in the server/.env file.",
  );
}

export const b2Client = new S3Client({
  endpoint,
  region: process.env.BB_REGION,
  credentials: {
    accessKeyId: process.env.BB_KEY_ID,
    secretAccessKey: process.env.BB_APP,
  },
});