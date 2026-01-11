/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client with service role key for RLS bypass
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================
// GET - Fetch all members
// ==========================
export async function GET() {
  const { data, error } = await supabase
    .from("bod")
    .select("*")
    .order("sequence", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// ==========================
// POST - Add member(s)
// ==========================
export async function POST(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { error: "Expected an array of board members" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.from("bod").upsert(body, {
    onConflict: "id",
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
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
