import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedJson } from "@/lib/adminAuth";

const MAX_IMAGE_SIZE = 32 * 1024 * 1024;

export async function POST(request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedJson();

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: 0, message: "Image upload is not configured." },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (
      !image ||
      typeof image === "string" ||
      !image.type.startsWith("image/")
    ) {
      return NextResponse.json(
        { success: 0, message: "A valid image file is required." },
        { status: 400 },
      );
    }

    if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: 0, message: "Image must be smaller than 32 MB." },
        { status: 400 },
      );
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", image);

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body: imgbbFormData },
    );
    const imgbbResult = await imgbbResponse.json();

    if (!imgbbResponse.ok || !imgbbResult.success || !imgbbResult.data?.url) {
      console.error("[admin/image-upload] ImgBB upload failed:", imgbbResult);
      return NextResponse.json(
        { success: 0, message: "Failed to upload image." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: 1,
      file: { url: imgbbResult.data.url },
    });
  } catch (error) {
    console.error("[admin/image-upload] Request failed:", error);
    return NextResponse.json(
      { success: 0, message: "Unable to process image upload." },
      { status: 500 },
    );
  }
}
