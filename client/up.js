import axios from "axios";
const fileInput = document.getElementById("fileInput");
const imgPreview = document.getElementById("image-preview");

async function getSignUrl(key, method, contentType, download) {
  const url = new URL("http://localhost:3000/signurl");
  url.searchParams.append("objectKey", key);
  url.searchParams.append("method", method);
  if (method === "PUT" && contentType) {
    url.searchParams.append("contentType", contentType);
  }
  if (method === "GET") {
    url.searchParams.append("download", download);
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to get signed URL: ${res.statusText}`);
  }

  const data = await res.json();
  console.log("received signed url", method, data);

  return data;
}

function updateImgUrl(url) {
  imgPreview.src = url;
}

function downloadFile(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function getFileMetaData(key) {
  const url = new URL("http://localhost:3000/uploadComplete");
  url.searchParams.append("objectKey", key);

  return axios.get(url).then((response) => {
    return response.data;
  });
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  console.log("uploading file", file);
  if (!file) return;

  const key = file.name;
  const download = false;
  const contentType = file.type || "application/octet-stream";
  const { url: putUrl } = await getSignUrl(key, "PUT", contentType, download);

  try {
    const response = await axios.put(putUrl, file, {
      headers: { "Content-Type": contentType },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || file.size),
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    console.log("File uploaded successfully", response);
    const { url: getUrl } = await getSignUrl(key, "GET", contentType, download);
    if (download) {
      downloadFile(getUrl, key);
    } else {
      updateImgUrl(getUrl);
    }
    const uploadResult = await getFileMetaData(key);
    console.log("Upload result:", uploadResult);
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response?.status,
      error.response?.data || error.message,
    );
  }
});
