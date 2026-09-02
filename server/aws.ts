// import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsClient } from "./clients/awsClient";

const bucketName = "aidebate-cli";

export async function createGetPresignedUrl(objectKey: string) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  // console.log(command)
  return getSignedUrl(awsClient, command, {
    expiresIn: 15 * 60,
  });
}

export async function createPutPresignedUrl(objectKey: string) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: "video/mp4",

  });

  // console.log(command)
  return getSignedUrl(awsClient, command, {
    expiresIn: 15 * 60,
    signableHeaders: new Set(["content-type"]),
  });
}

// Example
/* const url = await createGetPresignedUrl(
  "uploads/1785992369681_spiral-binding.png",
); */
const url = await createPutPresignedUrl("test.mp4");

console.log(url);
