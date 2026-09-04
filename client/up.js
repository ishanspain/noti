const fileInput = document.getElementById("fileInput");

async function getSignUrl(key, method) {
  const url = new URL("http://localhost:3000/signurl");
  url.searchParams.append("objectKey", key);
  url.searchParams.append("method", method);

  const res = await fetch(url);
  console.log("received signed url", res);

  if (!res.ok) {
    throw new Error(`Failed to get signed URL: ${res.statusText}`);
  }

  return res.json();
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  console.log("uploading file", file);
  if (!file) return;

  const key = file.name;
  const method = "PUT";
  const { url } = await getSignUrl(key, method);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(url, {
      method: "PUT",
      // body: formData,
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    if (response.ok) {
      console.log("File uploaded successfully");
    } else {
      console.error("File upload failed");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
});
