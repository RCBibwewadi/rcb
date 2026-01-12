// app/api/quick/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.type.startsWith("video") && file.size > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      { error: "Video must be under 20MB" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop();
  const folder = file.type.startsWith("video") ? "videos" : "images";

  const filePath = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("quick-media")
    .upload(filePath, file, {
      cacheControl: "public, max-age=1800, stale-while-revalidate=600",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from("quick-media").getPublicUrl(filePath);

  return NextResponse.json({
    media_url: data.publicUrl,
    thumbnail: data.publicUrl, // can later replace with generated thumb
  });
}
