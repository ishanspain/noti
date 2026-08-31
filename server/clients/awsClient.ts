process.loadEnvFile(".env");
import { S3Client } from "@aws-sdk/client-s3";

export const awsClient = new S3Client({
  // endpoint,
  // region: process.env.BB_REGION,
  // credentials: {
  //   accessKeyId: process.env.BB_KEY_ID,
  //   secretAccessKey: process.env.BB_APP,
  // },
});