import { getSignedUrl } from "@aws-sdk/cloudfront-signer"; // ESM
// const { getSignedUrl } = require("@aws-sdk/cloudfront-signer"); // CJS
import { readFileSync } from "node:fs";

const pk = readFileSync("/home/karan/Desktop/noti/private_key.pem", "utf8");

const cloudfrontDistributionDomain = "https://d1w8kbx0bk8b9x.cloudfront.net";
// const s3ObjectKey = "jmi-3.png";
// const url = `${cloudfrontDistributionDomain}/${s3ObjectKey}`;
const privateKey = pk;
const keyPairId = "K2DB8A110MX427";

export function createCfSignedUrl(ObjectKey: string, Seconds: number) {
  const url = `${cloudfrontDistributionDomain}/${ObjectKey}`;
  const dateLessThan = new Date(Date.now() + Seconds * 1000).toISOString();

  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });

  return signedUrl;
}
