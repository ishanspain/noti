import { GetBucketPolicyCommand, ListBucketsCommand, GetPublicAccessBlockCommand , ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { awsClient } from "./clients/awsClient";

class Aws {
  public static readonly listBuckets = async () => {
    try {
      const data = await awsClient.send(new ListBucketsCommand({}));
      console.log("Success", data.Buckets);
      return data.Buckets;
    } catch (err) {
      console.log("Error", err);
    }
  };

  public static readonly getPublicAccessBlock = async () => {
    try {
      const data = await awsClient.send(new GetPublicAccessBlockCommand({Bucket: "aidebate-cli"}));
      console.log("Success", data.PublicAccessBlockConfiguration);
      return data.PublicAccessBlockConfiguration;
    } catch (err) {
      console.log("Error", err);
    }
  };

  public static readonly getBucketPolicy = async () => {
    try {
      const data = await awsClient.send(new GetBucketPolicyCommand({Bucket: "aidebate-cli"}));
      console.log("Success", data.Policy);
      return data.Policy;
    } catch (err) {
      console.log("Error", err);
    }
  };

    public static readonly listObjects = async () => {
    try {
      const data = await awsClient.send(new ListObjectsV2Command({Bucket: "aidebate-cli"}));
      console.log("Success", data.Contents);
      return data.Contents;
    } catch (err) {
      console.log("Error", err);
    }
  };

    public static readonly getObject = async (objectKey: string) => {
    try {
      const data = await awsClient.send(new GetObjectCommand({Bucket: "aidebate-cli", Key: objectKey}));
      console.log("Success", data);
     /*  data.Body?.transformToString().then((body) => {
        console.log("Body", body);
      }); */

      data.Body?.on("data", (chunk) => {
        console.log("Data", chunk);
      });
      return data;
    } catch (err) {
      console.log("Error", err);
    }
  };

}

// await Aws.getPublicAccessBlock();
// await Aws.getBucketPolicy();
// await Aws.listObjects();
await Aws.getObject("hello");
