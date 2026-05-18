import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FormSubmission } from "@/types/database";
import { getTenantId } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: formId } = await params;
    const tenantId = await getTenantId();

    // Verify form belongs to tenant
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id")
      .eq("id", formId)
      .eq("tenant_id", tenantId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { data, error, count } = await supabase
      .from("form_submissions")
      .select("*, contacts(id, first_name, last_name, email)", { count: "exact" })
      .eq("form_id", formId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data as FormSubmission[],
      total: count,
      limit,
      offset,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
