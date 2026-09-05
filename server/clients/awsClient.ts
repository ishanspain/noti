process.loadEnvFile(".env");
import { S3Client } from "@aws-sdk/client-s3";

const accessKeyId = process.env.AWS_A_ACCESS_KEY ?? "";
const secretAccessKey = process.env.AWS_A_SECRET_KEY ?? "";

export const awsClient = new S3Client({
  // endpoint,
  region: "ap-south-1",
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
