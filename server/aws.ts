// import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsClient } from "./clients/awsClient";

const bucketName = "printcampus";

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
    ContentType: "image/png",
  });

  // console.log(command)
  return getSignedUrl(awsClient, command, {
    expiresIn: 15 * 60,
    signableHeaders: new Set(["content-type"]),
  });
}

export async function createDeletePresignedUrl(objectKey: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  // console.log(command)
  return getSignedUrl(awsClient, command, {
    expiresIn: 15 * 60,
  });
}

// Example
// const url = await createGetPresignedUrl("test/test.jpg");
const url = await createPutPresignedUrl("test/jmi-2.png");
// const url = await createDeletePresignedUrl("test/jmi-2.png");

console.log(url);
