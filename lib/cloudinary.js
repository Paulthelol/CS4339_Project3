async function uploadImage(file) {
  const formData = new FormData();
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!file) {
    throw new Error("No file provided for upload");
  }

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary env vars: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET");
  }

  formData.append("file", file);

  // replace with YOUR preset name
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || `Cloudinary upload failed (${response.status})`;
    throw new Error(message);
  }

  console.log(data);

  return data.secure_url;
}

export default uploadImage;