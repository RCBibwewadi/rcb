import { supabaseServer } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET one project with images
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { data, error } = await supabaseServer
    .from("projects")
    .select("*, project_images(image_url)")
    .eq("id", id)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// ✅ UPDATE project details
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updates = await req.json();

  const { error } = await supabaseServer
    .from("projects")
    .update(updates)
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Project updated successfully" });
}

// ✅ DELETE project and its images
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Delete images (optional — Supabase can cascade delete if FK is set)
  await supabaseServer.from("project_images").delete().eq("project_id", id);

  // Delete project
  const { error } = await supabaseServer.from("projects").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Project deleted successfully" });
}
