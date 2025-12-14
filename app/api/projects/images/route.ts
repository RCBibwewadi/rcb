import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { project_id, image_url } = body;

  if (!project_id || !image_url) {
    return NextResponse.json(
      { error: "project_id and image_url required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("project_images")
    .insert({
      project_id,
      image_url,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ image: data });
}
