// app/api/bod/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET request: fetch bod data
export async function GET() {
  const { data, error } = await supabaseServer
    .from("bod")
    .select("*")
    .eq("slug", "bod")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || {});
}

// POST request: update bod data
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!Array.isArray(body)) {
    return NextResponse.json(
      { error: "Expected an array of board members" },
      { status: 400 }
    );
  }
  const { data, error } = await supabaseServer.from("bod").insert(body);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
