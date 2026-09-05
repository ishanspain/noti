// import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsClient } from "./clients/awsClient";

const bucketName = "printcampus-dev";
const bucketPrefix = "test";

const getBucketKey = (objectKey: string) =>
  `${bucketPrefix}/${objectKey.replace(/^\/+/, "")}`;

export class AwsService {
  private constructor() {}

  public static async createGetPresignedUrl(objectKey: string) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: getBucketKey(objectKey),
    });

    // console.log(command)
    return getSignedUrl(awsClient, command, {
      expiresIn: 15 * 60,
    });
  }

  public static async createPutPresignedUrl(objectKey: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: getBucketKey(objectKey),
      ContentType: contentType,
    });

    // console.log(command)
    return getSignedUrl(awsClient, command, {
      expiresIn: 15 * 60,
      signableHeaders: new Set(["content-type"]),
    });
  }

  public static async createDeletePresignedUrl(objectKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: getBucketKey(objectKey),
    });

    // console.log(command)
    return getSignedUrl(awsClient, command, {
      expiresIn: 15 * 60,
    });
  }
}

// Example
// const url = await AwsService.createGetPresignedUrl("test.jpg");
// const url = await AwsService.createPutPresignedUrl("sal-1.png");
// const url = await AwsService.createDeletePresignedUrl("jmi-2.png");

// console.log(url);
