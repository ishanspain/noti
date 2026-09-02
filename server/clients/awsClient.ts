process.loadEnvFile(".env");
import { S3Client } from "@aws-sdk/client-s3";

export const awsClient = new S3Client({
  // endpoint,
  region: "ap-south-1",
  // credentials: {
  //   accessKeyId: process.env.AWS_KEY,
  //   secretAccessKey: process.env.AWS_SECRET,
  // },
});