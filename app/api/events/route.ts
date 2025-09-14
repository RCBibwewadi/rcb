import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // keep this private
);

// GET: fetch all events
export async function GET() {
  const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: insert new events
export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase.from("events").insert(body).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("events")
    .update(rest)
    .eq("id", id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

// DELETE: delete event by id
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true }, { status: 200 });
}