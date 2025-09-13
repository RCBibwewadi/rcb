import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch board members
export async function GET() {
  const { data, error } = await supabase.from("bod").select("*").order("createdAt", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase.from("bod").insert([
    {
      name: body.name,
      position: body.position,
      description: body.description,
      image_url: body.image_url,
      gradient: body.gradient,
      label: body.label,
      sequence: body.sequence,
    },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("bod")
    .update({
      name: body.name,
      position: body.position,
      description: body.description,
      image_url: body.image_url,
      gradient: body.gradient,
      label: body.label,
      sequence: body.sequence,
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE a board member
export async function DELETE(req: Request) {
  const { id } = await req.json();

  const { error } = await supabase.from("bod").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}