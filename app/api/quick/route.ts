import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DEFAULT thumbnail fallback
const DEFAULT_THUMB = "https://placehold.co/600x400?text=Rotaract";

export async function GET() {
  const { data, error } = await supabase
    .from("quick_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

// CREATE
export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    section,
    title,
    description,
    media_type,
    media_url = "",
    thumbnail_url,
    sequence = 0,
  } = body;

  const { data, error } = await supabase
    .from("quick_items")
    .insert([
      {
        section,
        title,
        description,
        media_type,
        media_url,
        thumbnail_url: thumbnail_url || DEFAULT_THUMB,
        sequence,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
// UPDATE
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;

  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("quick_items")
    .update({
      ...rest,
      thumbnail_url: rest.thumbnail || DEFAULT_THUMB,
    })
    .eq("id", id)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { error } = await supabase.from("quick_items").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
