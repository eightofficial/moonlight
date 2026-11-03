


export const imgUpload = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("/api/admin/blogs/uploadImage", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok || data.success !== 1 || !data.file?.url) {
      throw new Error(data.message || "Image upload failed.");
    }

    return data.file.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};