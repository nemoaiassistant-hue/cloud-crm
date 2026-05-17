import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Contact } from "@/types/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { tags } = await request.json();

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: "tags must be a non-empty array of strings" },
        { status: 400 }
      );
    }

    // Fetch existing contact to merge tags
    const { data: contact, error: fetchError } = await supabase
      .from("contacts")
      .select("tags")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const existingTags: string[] = ((contact as any).tags as string[]) || [];
    const mergedTags = Array.from(new Set([...existingTags, ...tags]));

    const { data, error } = await supabase
      .from("contacts")
      .update({ tags: mergedTags, updated_at: new Date().toISOString() } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Contact });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
