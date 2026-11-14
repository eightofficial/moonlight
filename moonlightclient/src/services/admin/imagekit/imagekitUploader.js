export const imageKitUpload = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/admin/product/uploadImage", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok || data.success !== 1 || !data.file?.url) {
    throw new Error(data.message || "Image upload failed.");
  }

  return data.file.url;
};
