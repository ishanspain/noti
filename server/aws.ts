// import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsClient } from "./clients/awsClient";
import { createCfSignedUrl } from "./cf";


const bucketName = "aidebate-cli";
const bucketPrefix = "";

interface downloadOptions {
  download?: boolean;
  filename?: string;
}

const getBucketKey = (objectKey: string) =>
  bucketPrefix
    ? `${bucketPrefix}/${objectKey.replace(/^\/+/, "")}`
    : objectKey.replace(/^\/+/, "");

export class AwsService {
  private constructor() {}

  public static async createGetPresignedUrl(
    objectKey: string,
    download: boolean,
  ) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename="${objectKey}"`,
    });

    // console.log(command)
    return getSignedUrl(awsClient, command, {
      expiresIn: 15 * 60,
    });
  }

  public static async createGetCfPresignedUrl(
    objectKey: string,
    options?: downloadOptions,
  ) {
   const url = createCfSignedUrl(objectKey, 5 * 60, options);

    // console.log(command)
    return url;
  }

  public static async createPutPresignedUrl(
    objectKey: string,
    contentType: string,
  ) {
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

  public static async deleteObject(objectKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: getBucketKey(objectKey),
    });

    return awsClient.send(command);
  }

  public static async getFileMetaData(objectKey: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: getBucketKey(objectKey),
      });
      const res = await awsClient.send(command);
      return { success: true, data: res };
    } catch (err) {
      console.log("Head object err", err);
      return { success: false, error: err };
    }
  }
}

// Example
// const url = await AwsService.createGetPresignedUrl("test.jpg");
// const url = await AwsService.createPutPresignedUrl("sal-1.png");
// const url = await AwsService.createDeletePresignedUrl("jmi-2.png");
// const url = await AwsService.createGetCfPresignedUrl("kls-white.png", true);
const url = await AwsService.createGetCfPresignedUrl("kls-white.png", { download: true, filename: "kls-white.png" });


console.log(url);

/* const res = await AwsService.getFileMetaData("test (2).jpeg");
console.log(res); */

/* const delres = await AwsService.deleteObject("Screenshot 2026-08-29 001355.png");
console.log("delete res", delres) */
