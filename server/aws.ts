// import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsClient } from "./clients/awsClient";

export async function createGetPresignedUrl(objectKey: string) {
  const command = new GetObjectCommand({
    Bucket: "printcampus",
    Key: objectKey,
  });

  // console.log(command)
  return getSignedUrl(awsClient, command, {
    expiresIn: 15 * 60,
  });
}

export async function createPutPresignedUrl(objectKey: string) {
  const command = new PutObjectCommand({
    Bucket: "printcampus",
    Key: objectKey,
  });

  // console.log(command)
  return getSignedUrl(awsClient, command, {
    expiresIn: 15 * 60,
  });
}

// Example
/* const url = await createGetPresignedUrl(
  "uploads/1785992369681_spiral-binding.png",
); */
const url = await createPutPresignedUrl("arun-thesis-flow-process.mp4");

console.log(url);
