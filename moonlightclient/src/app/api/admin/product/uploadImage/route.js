import ImageKit from "@imagekit/nodejs";
import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedJson } from "@/lib/adminAuth";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 32 * 1024 * 1024;

export async function POST(request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedJson();

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
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

    const fileName =
      image.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) ||
      "product-image";
    const imageKit = new ImageKit({ privateKey });
    const uploadedImage = await imageKit.files.upload({
      file: image,
      fileName,
    });

    if (!uploadedImage.url) {
      throw new Error("ImageKit did not return an image URL.");
    }

    return NextResponse.json({
      success: 1,
      file: { url: uploadedImage.url },
    });
  } catch (error) {
    console.error(
      "[admin/product-image-upload] Request failed:",
      error?.message,
    );
    return NextResponse.json(
      { success: 0, message: "Unable to upload product image." },
      { status: 502 },
    );
  }
}
