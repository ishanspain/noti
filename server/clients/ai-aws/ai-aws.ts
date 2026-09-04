import {
  GetBucketAclCommand,
  GetBucketCorsCommand,
  GetBucketEncryptionCommand,
  GetBucketLifecycleConfigurationCommand,
  GetBucketLocationCommand,
  GetBucketLoggingCommand,
  GetBucketNotificationConfigurationCommand,
  GetBucketOwnershipControlsCommand,
  GetBucketPolicyCommand,
  GetBucketTaggingCommand,
  GetBucketVersioningCommand,
  GetBucketWebsiteCommand,
  GetObjectCommand,
  GetPublicAccessBlockCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListMultipartUploadsCommand,
  ListObjectVersionsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { fileURLToPath } from "node:url";

process.loadEnvFile(fileURLToPath(new URL("../../.env", import.meta.url)));

const config = {
  accessKeyId: process.env.AWS_APPSINVO_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.AWS_APPSINVO_SECRET_ACCESS_KEY ?? "",
  region: process.env.AWS_APPSINVO_REGION ?? "",
  bucket: process.env.AWS_APPSINVO_BUCKET ?? "",
  prefix: "printcart24/",
};

const client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

type Probe = { permission: string; run: () => Promise<unknown> };

function errorSummary(error: unknown) {
  const value = error as {
    name?: string;
    Code?: string;
    message?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return {
    status: value.$metadata?.httpStatusCode,
    code: value.Code ?? value.name ?? "UnknownError",
    message: value.message,
  };
}

async function runProbe({ permission, run }: Probe) {
  try {
    await run();
    console.log(`ALLOWED  ${permission}`);
    return;
  } catch (error) {
    const summary = errorSummary(error);
    // For configuration getters, 404 means the request was authorized but the
    // optional configuration does not exist.
    if (summary.status === 404 || summary.code === "NoSuchConfiguration") {
      console.log(`ALLOWED  ${permission} (configuration is not set)`);
      return;
    }
    console.log(
      `DENIED   ${permission} (${summary.status ?? "no status"} ${summary.code})`,
    );
  }
}

async function auditS3Permissions() {
  const bucket = config.bucket;
  const probes: Probe[] = [
    ["s3:ListAllMyBuckets", new ListBucketsCommand({})],
    ["s3:ListBucket (HeadBucket)", new HeadBucketCommand({ Bucket: bucket })],
    ["s3:GetBucketLocation", new GetBucketLocationCommand({ Bucket: bucket })],
    [
      "s3:ListBucket (ListObjectsV2)",
      new ListObjectsV2Command({ Bucket: bucket, Prefix: config.prefix, MaxKeys: 1 }),
    ],
    [
      "s3:ListBucketVersions",
      new ListObjectVersionsCommand({
        Bucket: bucket,
        Prefix: config.prefix,
        MaxKeys: 1,
      }),
    ],
    [
      "s3:ListBucketMultipartUploads",
      new ListMultipartUploadsCommand({ Bucket: bucket, MaxUploads: 1 }),
    ],
    ["s3:GetBucketAcl", new GetBucketAclCommand({ Bucket: bucket })],
    ["s3:GetBucketPolicy", new GetBucketPolicyCommand({ Bucket: bucket })],
    ["s3:GetBucketCORS", new GetBucketCorsCommand({ Bucket: bucket })],
    [
      "s3:GetEncryptionConfiguration",
      new GetBucketEncryptionCommand({ Bucket: bucket }),
    ],
    [
      "s3:GetLifecycleConfiguration",
      new GetBucketLifecycleConfigurationCommand({ Bucket: bucket }),
    ],
    ["s3:GetBucketLogging", new GetBucketLoggingCommand({ Bucket: bucket })],
    [
      "s3:GetBucketNotification",
      new GetBucketNotificationConfigurationCommand({ Bucket: bucket }),
    ],
    [
      "s3:GetBucketOwnershipControls",
      new GetBucketOwnershipControlsCommand({ Bucket: bucket }),
    ],
    ["s3:GetBucketTagging", new GetBucketTaggingCommand({ Bucket: bucket })],
    ["s3:GetBucketVersioning", new GetBucketVersioningCommand({ Bucket: bucket })],
    ["s3:GetBucketWebsite", new GetBucketWebsiteCommand({ Bucket: bucket })],
    [
      "s3:GetBucketPublicAccessBlock",
      new GetPublicAccessBlockCommand({ Bucket: bucket }),
    ],
  ].map(([permission, command]) => ({
    permission: permission as string,
    run: () => client.send(command as never),
  }));

  for (const probe of probes) await runProbe(probe);

  try {
    const listed = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: config.prefix,
        MaxKeys: 1,
      }),
    );
    const key = listed.Contents?.[0]?.Key;
    if (!key) {
      console.log("SKIPPED  object probes (no object found in configured prefix)");
      return;
    }

    await runProbe({
      permission: "s3:GetObject metadata (HeadObject)",
      run: () => client.send(new HeadObjectCommand({ Bucket: bucket, Key: key })),
    });
    await runProbe({
      permission: "s3:GetObject (one-byte ranged read)",
      run: async () => {
        const result = await client.send(
          new GetObjectCommand({ Bucket: bucket, Key: key, Range: "bytes=0-0" }),
        );
        await result.Body?.transformToByteArray();
      },
    });
  } catch (error) {
    const summary = errorSummary(error);
    console.log(
      `SKIPPED  object probes (listing failed: ${summary.status ?? "no status"} ${summary.code})`,
    );
  }

  console.log("NOTE     PUT and DELETE were not tested because they mutate the bucket.");
}

await auditS3Permissions();


// ==================================================
/* PS C:\Users\User\Desktop\noti\server> tsx C:\Users\User\Desktop\noti\server\clients\ai-aws.ts
ALLOWED  s3:ListAllMyBuckets
ALLOWED  s3:ListBucket (HeadBucket)
ALLOWED  s3:GetBucketLocation
ALLOWED  s3:ListBucket (ListObjectsV2)
ALLOWED  s3:ListBucketVersions
ALLOWED  s3:ListBucketMultipartUploads
ALLOWED  s3:GetBucketAcl
ALLOWED  s3:GetBucketPolicy
ALLOWED  s3:GetBucketCORS
ALLOWED  s3:GetEncryptionConfiguration
ALLOWED  s3:GetLifecycleConfiguration (configuration is not set)
ALLOWED  s3:GetBucketLogging
ALLOWED  s3:GetBucketNotification
ALLOWED  s3:GetBucketOwnershipControls
ALLOWED  s3:GetBucketTagging (configuration is not set)
ALLOWED  s3:GetBucketVersioning
ALLOWED  s3:GetBucketWebsite (configuration is not set)
ALLOWED  s3:GetBucketPublicAccessBlock
ALLOWED  s3:GetObject metadata (HeadObject)
ALLOWED  s3:GetObject (one-byte ranged read)
NOTE     PUT and DELETE were not tested because they mutate the bucket.
PS C:\Users\User\Desktop\noti\server>  */
