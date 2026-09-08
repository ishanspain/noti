import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";
import { fileURLToPath } from "node:url";

process.loadEnvFile(".env");

const region = process.env.AWS_APPSINVO_REGION;
const accessKeyId = process.env.AWS_APPSINVO_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_APPSINVO_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error(
    "Missing AWS_APPSINVO_REGION, AWS_APPSINVO_ACCESS_KEY_ID, or AWS_APPSINVO_SECRET_ACCESS_KEY.",
  );
}

const ec2 = new EC2Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

/**
 * Checks whether these credentials can read EC2 instances in the configured region.
 * This makes only the read-only ec2:DescribeInstances request.
 */
async function checkEc2Access() {
  try {
    const response = await ec2.send(new DescribeInstancesCommand({ MaxResults: 5 }));
    const instanceCount = response.Reservations?.reduce(
      (count, reservation) => count + (reservation.Instances?.length ?? 0),
      0,
    ) ?? 0;

    console.log(
      `EC2 access confirmed in ${region}. Found ${instanceCount} instance(s) in the first page.`,
    );
  } catch (error) {
    const awsError = error as {
      name?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number };
    };

    console.error("EC2 access was not confirmed.", {
      status: awsError.$metadata?.httpStatusCode,
      code: awsError.name,
      message: awsError.message,
    });
    process.exitCode = 1;
  }
}

void checkEc2Access();
