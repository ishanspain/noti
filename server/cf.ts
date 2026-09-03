import { getSignedUrl } from "@aws-sdk/cloudfront-signer"; // ESM
// const { getSignedUrl } = require("@aws-sdk/cloudfront-signer"); // CJS
import { readFileSync } from "node:fs";

const pk = readFileSync("private_key.pem", "utf8");

const cloudfrontDistributionDomain = "https://d1w8kbx0bk8b9x.cloudfront.net";
const s3ObjectKey = "jmi-3.png";
const url = `${cloudfrontDistributionDomain}/${s3ObjectKey}`;
const privateKey = pk;
const keyPairId = "K2DB8A110MX427";
const dateLessThan = "2026-09-04"; // any Date constructor compatible

const signedUrl = getSignedUrl({
  url,
  keyPairId,
  dateLessThan,
  privateKey,
});

console.log(signedUrl);