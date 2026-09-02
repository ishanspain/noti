// import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { b2Client } from "./clients/bbclient";

export async function createGetPresignedUrl(objectKey: string) {
  const command = new GetObjectCommand({
    Bucket: "printcampus",
    Key: objectKey,
  });

  return getSignedUrl(b2Client, command, {
    expiresIn: 15 * 60,
  });
}

// Example
const url = await createGetPresignedUrl(
  "uploads/1785992369681_spiral-binding.png",
);

console.log(url);
