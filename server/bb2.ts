import {
  GetBucketPolicyCommand,
  ListBucketsCommand,
  GetPublicAccessBlockCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import {
  createReadStream,
  createWriteStream,
  readFileSync,
  statSync,
} from "node:fs";
import { b2Client } from "./clients/bbclient";
import * as os from "os";
import * as path from "path";
import { pipeline } from "stream/promises";
import { Transform } from "node:stream";

const bucketName = "printcampus";

class Bb {
  public static readonly listBuckets = async () => {
    try {
      const data = await b2Client.send(new ListBucketsCommand({}));
      console.log("Success", data.Buckets);
      return data.Buckets;
    } catch (err) {
      console.log("Error", err);
    }
  };

  public static readonly getPublicAccessBlock = async () => {
    try {
      const data = await b2Client.send(
        new GetPublicAccessBlockCommand({ Bucket: bucketName }),
      );
      console.log("Success", data.PublicAccessBlockConfiguration);
      return data.PublicAccessBlockConfiguration;
    } catch (err) {
      console.log("Error", err);
    }
  };

  public static readonly getBucketPolicy = async () => {
    try {
      const data = await b2Client.send(
        new GetBucketPolicyCommand({ Bucket: bucketName }),
      );
      console.log("Success", data.Policy);
      return data.Policy;
    } catch (err) {
      console.log("Error", err);
    }
  };

  public static readonly listObjects = async () => {
    try {
      const data = await b2Client.send(
        new ListObjectsV2Command({ Bucket: bucketName }),
      );
      console.log("Success", data.Contents);
      return data.Contents;
    } catch (err) {
      console.log("Error", err);
    }
  };

  public static readonly getObject = async (objectKey: string) => {
    try {
      const data = await b2Client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: objectKey }),
      );
      console.log("Success", data);
      /*  data.Body?.transformToString().then((body) => {
        console.log("Body", body);
      }); */

      /*  data.Body?.on("data", (chunk) => {
        console.log("Data", chunk);
      }); */

      pipeline(data.Body, createWriteStream("test.jpeg"));

      return data;
    } catch (err) {
      console.log("Error", err);
    }
  };

  public static readonly putObject = async (
    objectKey: string,
    filePath: string,
  ) => {
    // let filename = objectKey;
    // let cc = 0;

    const downloadsPath = path.join(os.homedir(), "Downloads", filePath);
    const fileName = path.basename(downloadsPath);
    const fileSize = statSync(downloadsPath).size;
    let uploadedBytes = 0;

    const progressStream = new Transform({
      transform(chunk, _encoding, callback) {
        uploadedBytes += chunk.length;

        const percentage = ((uploadedBytes / fileSize) * 100).toFixed(2);
        process.stdout.write(
          `\rProcessed: ${uploadedBytes}/${fileSize} bytes (${percentage}%)`,
        );

        callback(null, chunk);
      },
    });

    const body = createReadStream(downloadsPath).pipe(progressStream);

    /*  if (filePath) {
      const downloadsPath = path.join(os.homedir(), "Downloads", filePath);

      filename = path.basename(downloadsPath);
    } */

    /* if (!body) {
      console.log("No body or file path provided for putObject");
      return;
    } */

    try {
      const result = await b2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: body,
        }),
      );
      console.log("Success", result);
      return result;
    } catch (err) {
      console.log("Error", err);
    }
  };

  public static readonly deleteObject = async (objectKey: string) => {
    try {
      const data = await b2Client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }),
      );
      console.log("Success", data);
      return data;
    } catch (err) {
      console.log("Error", err);
    }
  };
}

// await Bb.listBuckets();
// await Bb.getPublicAccessBlock();
// await Bb.getBucketPolicy();
// await Bb.listObjects();
// await Bb.getObject("arun-thesis-flow-process.mp4");
await Bb.putObject("aws.ts", "26-08-26-vids/arun-thesis-flow-process.mp4");
// await Bb.deleteObject("Thesis_production_process_animation_202607270658.mp4");
