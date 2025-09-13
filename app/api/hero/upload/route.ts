import { supabaseServer } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get formData from the request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Create a unique filename
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabaseServer.storage
      .from("hero-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = supabaseServer.storage
      .from("hero-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  }catch (err) {
  if (err instanceof Error) {
    alert("Error: " + err.message);
  } else {
    alert("Error: " + String(err));
  }
}
}
