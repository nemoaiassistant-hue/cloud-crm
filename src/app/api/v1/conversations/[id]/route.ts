import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TENANT_ID = "demo-tenant-001";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("conversations")
      .select("*, contacts(first_name, last_name)")
      .eq("id", id)
      .eq("tenant_id", TENANT_ID)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
