const fileInput = document.getElementById("fileInput");

async function getSignUrl(key, method, contentType) {
  const url = new URL("http://localhost:3000/signurl");
  url.searchParams.append("objectKey", key);
  url.searchParams.append("method", method);
  if (method === "PUT" && contentType) {
    url.searchParams.append("contentType", contentType);
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to get signed URL: ${res.statusText}`);
  }

  const data = await res.json();
  console.log("received signed url", data);

  return data;
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  console.log("uploading file", file);
  if (!file) return;

  const key = file.name;
  const method = "PUT";
  const contentType = file.type || "application/octet-stream";
  const { url } = await getSignUrl(key, method, contentType);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(url, {
      method: "PUT",
      // body: formData,
      headers: { "Content-Type": contentType },
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
