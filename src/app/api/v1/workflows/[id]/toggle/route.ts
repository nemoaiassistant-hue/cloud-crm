import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { Workflow } from "@/types/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { id } = await params;
    const body = await request.json();

    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "is_active must be a boolean" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workflows")
      .update({ is_active })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json({ data: data as Workflow });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
