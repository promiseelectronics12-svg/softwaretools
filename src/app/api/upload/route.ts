import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

/**
 * POST /api/upload
 * Admin-only. Receives a multipart file, uploads to ImgBB, returns the URL.
 * Requires IMGBB_API_KEY in environment.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey || apiKey === "your-imgbb-api-key-here") {
    return NextResponse.json(
      { error: "IMGBB_API_KEY not configured. Add it to your .env file." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 32 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 32 MB" }, { status: 400 });
  }

  // Convert to base64 for ImgBB API
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const body = new URLSearchParams();
  body.append("image", base64);
  body.append("name", file.name.replace(/\.[^.]+$/, ""));

  const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body,
  });

  const imgbbData = await imgbbRes.json();

  if (!imgbbRes.ok || !imgbbData.data?.url) {
    return NextResponse.json(
      { error: imgbbData.error?.message || "Upload failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    url: imgbbData.data.url as string,
    displayUrl: imgbbData.data.display_url as string,
  });
}
