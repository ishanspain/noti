import { Upload } from "@aws-sdk/lib-storage";
import { awsClient } from "./clients/awsClient";
import { createReadStream } from "node:fs";

/* const rs = createReadStream(
  "/home/karan/Downloads/Thesis_animation_five_steps_202607260829.mp4",
); */

const rs = createReadStream(
  "C:\\Users\\User\\Downloads\\knLanShare\\Screenshot_2026-08-12-14-22-07-51_40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
);

try {
  const upload = new Upload({
    client: awsClient,
    params: {
      Bucket: "printcampus",
      Key: "test/test.jpg",
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
