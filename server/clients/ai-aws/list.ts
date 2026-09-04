import {
  ListObjectVersionsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { once } from "node:events";
import { createWriteStream } from "node:fs";
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

const outputUrl = new URL("./s3-list-output.txt", import.meta.url);
const output = createWriteStream(outputUrl, {
  encoding: "utf8",
  flags: "w",
});

async function writeLine(value: string) {
  if (!output.write(`${value}\n`)) {
    await once(output, "drain");
  }
}

async function listAllObjects(prefix?: string) {
  let continuationToken: string | undefined;
  let objectCount = 0;
  let totalBytes = 0;

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix || undefined,
        ContinuationToken: continuationToken,
        MaxKeys: 1_000,
      }),
    );

    for (const object of page.Contents ?? []) {
      const size = object.Size ?? 0;
      objectCount += 1;
      totalBytes += size;

      await writeLine(
        JSON.stringify({
          key: object.Key,
          size,
          lastModified: object.LastModified?.toISOString(),
          eTag: object.ETag,
          storageClass: object.StorageClass,
        }),
      );
    }

    continuationToken = page.IsTruncated
      ? page.NextContinuationToken
      : undefined;
  } while (continuationToken);

  await writeLine(
    JSON.stringify(
      {
        bucket: config.bucket,
        prefix: prefix || "(entire bucket)",
        objectCount,
        totalBytes,
      },
      null,
      2,
    ),
  );
}

async function listAllChanges(prefix?: string) {
  let keyMarker: string | undefined;
  let versionIdMarker: string | undefined;
  let versionCount = 0;
  let deleteMarkerCount = 0;

  do {
    const page = await client.send(
      new ListObjectVersionsCommand({
        Bucket: config.bucket,
        Prefix: prefix || undefined,
        KeyMarker: keyMarker,
        VersionIdMarker: versionIdMarker,
        MaxKeys: 1_000,
      }),
    );

    for (const version of page.Versions ?? []) {
      versionCount += 1;
      await writeLine(
        JSON.stringify({
          type: "version",
          key: version.Key,
          versionId: version.VersionId,
          isLatest: version.IsLatest,
          size: version.Size,
          lastModified: version.LastModified?.toISOString(),
          eTag: version.ETag,
          storageClass: version.StorageClass,
        }),
      );
    }

    for (const marker of page.DeleteMarkers ?? []) {
      deleteMarkerCount += 1;
      await writeLine(
        JSON.stringify({
          type: "delete-marker",
          key: marker.Key,
          versionId: marker.VersionId,
          isLatest: marker.IsLatest,
          lastModified: marker.LastModified?.toISOString(),
        }),
      );
    }

    if (page.IsTruncated) {
      keyMarker = page.NextKeyMarker;
      versionIdMarker = page.NextVersionIdMarker;
    } else {
      keyMarker = undefined;
      versionIdMarker = undefined;
    }
  } while (keyMarker);

  await writeLine(
    JSON.stringify(
      {
        bucket: config.bucket,
        prefix: prefix || "(entire bucket)",
        versionCount,
        deleteMarkerCount,
      },
      null,
      2,
    ),
  );
}

const showVersions = process.argv.includes("--versions");
const prefixArgument = process.argv.find(
  (argument, index) => index > 1 && argument !== "--versions",
);

try {
  if (showVersions) {
    await listAllChanges(prefixArgument);
  } else {
    await listAllObjects(prefixArgument);
  }

  output.end();
  await once(output, "finish");
  console.log(`Output written to ${fileURLToPath(outputUrl)}`);
} catch (error) {
  output.destroy();
  const value = error as {
    name?: string;
    message?: string;
    $metadata?: { httpStatusCode?: number };
  };

  console.error("Unable to list S3 objects", {
    status: value.$metadata?.httpStatusCode,
    code: value.name,
    message: value.message,
  });
  process.exitCode = 1;
}
