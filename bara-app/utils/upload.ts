export interface UploadResult {
  url: string;
  provider: "cloudinary" | "s3";
  folder?: string;
  publicId?: string;
}

interface UserInfo {
  name: string;
  id: string;
}

export async function uploadImage(
  file: File,
  userType: "Writer" | "Producer",
  user: UserInfo,
  imageType: "profile-picture" | "script-cover" = "profile-picture",
): Promise<UploadResult> {
  if (!file) throw new Error("No file provided");
  debugger;
  const provider = process.env.NEXT_PUBLIC_UPLOAD_PROVIDER || "cloudinary";
  const nameParts = user.name.split(" ").join("_").toUpperCase();
  const folder = `bara/${userType}_${nameParts}-${user.id}`;

  if (provider === "cloudinary") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );
    formData.append("folder", folder);

    const publicId =
      imageType === "script-cover"
        ? `script-cover-${Date.now()}`
        : "profile-picture";

    formData.append("public_id", publicId);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) throw new Error("Cloudinary upload failed");
    const data = await res.json();

    return {
      url: data.secure_url,
      provider: "cloudinary",
      folder,
      publicId: data.public_id,
    };
  }

  if (provider === "s3") {
    const response = await fetch(`/api/upload-url?folder=${folder}`);
    if (!response.ok) throw new Error("Failed to get S3 upload URL");
    const { uploadUrl, fileUrl } = await response.json();

    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    return {
      url: fileUrl,
      provider: "s3",
      folder,
    };
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export async function downloadImage(
  publicIdOrUrl: string,
  provider: "cloudinary" | "s3",
): Promise<string> {
  try {
    if (provider === "cloudinary") {
      if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicIdOrUrl}.jpg`;
    }

    if (provider === "s3") {
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
      return `https://${bucket}.s3.amazonaws.com/${publicIdOrUrl}`;
    }

    throw new Error("Invalid provider");
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}
