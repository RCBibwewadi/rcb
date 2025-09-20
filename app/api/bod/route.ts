/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client with service role key for RLS bypass
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================
// PUT - Bulk update members
// ==========================
export async function PUT(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { error: "Expected an array of board members" },
      { status: 400 }
    );
  }

  const results: any[] = [];

  for (const member of body) {
    const { data, error } = await supabase
      .from("bod")
      .update({
        name: member.name,
        position: member.position,
        description: member.description,
        image_url: member.image_url,
        gradient: member.gradient,
        label: member.label,
        sequence: member.sequence,
      })
      .eq("id", member.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    results.push(data);
  }

  return NextResponse.json(results, { status: 200 });
}

// ==========================
// DELETE - Remove by ID
// ==========================
export async function DELETE(req: Request) {
  const { id } = await req.json();

  const { error } = await supabase.from("bod").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
