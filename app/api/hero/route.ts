// app/api/hero/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET request: fetch hero data
export async function GET() {
  const { data, error } = await supabaseServer
    .from("hero")
    .select("*")
    .eq("slug", "hero")
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || {});
}

// POST request: update hero data
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { backgroundImage, title, subtitle, description, ctaText } = body;

  const { data, error } = await supabaseServer
    .from("hero")
    .upsert(
      [
        {
          slug: "hero",
          background_image: backgroundImage,
          title,
          subtitle,
          description,
          cta_text: ctaText,
        },
      ],
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
