const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      "https://aidebate-cli.s3.ap-south-1.amazonaws.com/sal-1.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQEIP3IOJNEICC675%2F20260904%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260904T004522Z&X-Amz-Expires=900&X-Amz-Signature=384d635338938afd2854219c2ff6e32f50fa99f18ef22b437205ca9a117e0ad2&X-Amz-SignedHeaders=content-type%3Bhost&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject",
      {
        method: "PUT",
        // body: formData,
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      },
    );

    if (response.ok) {
      console.log("File uploaded successfully");
    } else {
      console.error("File upload failed");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
});
