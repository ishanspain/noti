process.loadEnvFile(".env");

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const command = new GetObjectCommand({
  Bucket: "images-cdn",
  Key: "amit shah bootm 10.png",
});

const url = await getSignedUrl(r2, command, {
  expiresIn: 3600, // 1 hour
});

console.log(url);