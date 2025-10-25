import { supabaseServer } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET all projects with images
export async function GET() {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("*, project_images(image_url)");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// ✅ POST a new project (and optional images)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      project_title,
      project_description,
      project_detail_description,
      image_urls = [],
    } = body;

    // 1️⃣ Insert project
    const { data: project, error: projectError } = await supabaseServer
      .from("projects")
      .insert([
        {
          project_title,
          project_description,
          project_detail_description,
        },
      ])
      .select()
      .single();

    if (projectError)
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      );

    // 2️⃣ Insert related images if any
    if (image_urls.length > 0) {
      const imageRows = image_urls.map((url: string) => ({
        project_id: project.id,
        image_url: url,
      }));

      const { error: imageError } = await supabaseServer
        .from("project_images")
        .insert(imageRows);

      if (imageError)
        return NextResponse.json(
          { error: imageError.message },
          { status: 500 }
        );
    }

    return NextResponse.json({
      message: "Project created successfully",
      project,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
