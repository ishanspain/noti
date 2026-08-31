import { ListBucketsCommand } from "@aws-sdk/client-s3";
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
}

await Aws.listBuckets();
