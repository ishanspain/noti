import { Upload } from "@aws-sdk/lib-storage";
import { awsClient } from "./clients/awsClient";
import { createReadStream } from "node:fs";

/* const rs = createReadStream(
  "/home/karan/Downloads/Thesis_animation_five_steps_202607260829.mp4",
); */

const rs = createReadStream(
  "/home/karan/Videos/Ne Zha 2 2025 1080p WEB-DL HEVC x265 5.1 BONE.mkv",
);

try {
  const upload = new Upload({
    client: awsClient,
    params: {
      Bucket: "aidebate-cli",
      Key: "test.mp4",
      Body: rs,
    },
  });

  upload.on("httpUploadProgress", (progress) => {
    if(!progress.loaded || !progress.total) return
    const precentage = Math.round((progress.loaded / progress.total) * 100);
    process.stderr.write(`\r progress percentage, ${precentage}% `);
  });

  const res = await upload.done();

//   console.log(res);
//   console.log(upload);
} catch (err) {
  console.log("error upload file", err);
}
