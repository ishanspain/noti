import {
  GetBucketPolicyCommand,
  GetPublicAccessBlockCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { fileURLToPath } from "node:url";

process.loadEnvFile(fileURLToPath(new URL("../../.env", import.meta.url)));

const config = {
  accessKeyId: process.env.AWS_APPSINVO_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.AWS_APPSINVO_SECRET_ACCESS_KEY ?? "",
  region: process.env.AWS_APPSINVO_REGION ?? "",
  bucket: process.env.AWS_APPSINVO_BUCKET ?? "",
};

const client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

function parsePolicy(policy: string | undefined): unknown {
  if (!policy) return null;

  try {
    return JSON.parse(policy);
  } catch {
    return JSON.parse(decodeURIComponent(policy));
  }
}

async function getBucketSecurityConfiguration() {
  const [publicAccessBlock, bucketPolicy] = await Promise.all([
    client.send(
      new GetPublicAccessBlockCommand({
        Bucket: config.bucket,
      }),
    ),
    client.send(
      new GetBucketPolicyCommand({
        Bucket: config.bucket,
      }),
    ),
  ]);

  console.log(
    "Public access block:\n",
    JSON.stringify(publicAccessBlock.PublicAccessBlockConfiguration, null, 2),
  );
  console.log(
    "Bucket policy:\n",
    JSON.stringify(parsePolicy(bucketPolicy.Policy), null, 2),
  );
}

try {
  await getBucketSecurityConfiguration();
} catch (error) {
  const value = error as {
    name?: string;
    message?: string;
    $metadata?: { httpStatusCode?: number };
  };

  console.error("Unable to read bucket security configuration", {
    status: value.$metadata?.httpStatusCode,
    code: value.name,
    message: value.message,
  });
  process.exitCode = 1;
}
