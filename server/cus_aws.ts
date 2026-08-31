import crypto from "node:crypto";

process.loadEnvFile(".env")

const accessKey = process.env.AWS_KEY;
const secretKey = process.env.AWS_SECRET;

const region = "ap-south-1";
// const bucket = "aidebate";
// const key = "chatFiles/_home_karan_Downloads_number-system.svg.png";
const bucket = "aidebate-cli";
const key = "videos/Thesis_animation_five_steps_202607260829.mp4";

const host = `${bucket}.s3.${region}.amazonaws.com`;

const now = new Date();

const amzDate = now
  .toISOString()
  .replace(/[:-]|\.\d{3}/g, "");

const dateStamp = amzDate.slice(0, 8);

const expires = 3600;

const credential = `${accessKey}/${dateStamp}/${region}/s3/aws4_request`;

const query = new URLSearchParams({
  "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
  "X-Amz-Credential": credential,
  "X-Amz-Date": amzDate,
  "X-Amz-Expires": String(expires),
  "X-Amz-SignedHeaders": "host",
});

const canonicalQueryString = [...query.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(
    ([k, v]) =>
      `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
  )
  .join("&");

const canonicalUri =
  "/" +
  key
    .split("/")
    .map(encodeURIComponent)
    .join("/");

const canonicalHeaders = `host:${host}\n`;

const signedHeaders = "host";

const payloadHash = "UNSIGNED-PAYLOAD";

const canonicalRequest = [
  "GET",
  canonicalUri,
  canonicalQueryString,
  canonicalHeaders,
  signedHeaders,
  payloadHash,
].join("\n");

const hash = (data) =>
  crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");

const hashedCanonicalRequest = hash(canonicalRequest);

const stringToSign = [
  "AWS4-HMAC-SHA256",
  amzDate,
  `${dateStamp}/${region}/s3/aws4_request`,
  hashedCanonicalRequest,
].join("\n");

const hmac = (key, data) =>
  crypto
    .createHmac("sha256", key)
    .update(data)
    .digest();

const kDate = hmac(
  `AWS4${secretKey}`,
  dateStamp
);

const kRegion = hmac(kDate, region);

const kService = hmac(kRegion, "s3");

const kSigning = hmac(kService, "aws4_request");

const signature = crypto
  .createHmac("sha256", kSigning)
  .update(stringToSign)
  .digest("hex");

query.set("X-Amz-Signature", signature);

const url =
  `https://${host}${canonicalUri}?${query.toString()}`;

console.log(url);