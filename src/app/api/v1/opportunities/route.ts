import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { opportunitySchema } from "@/lib/validations";
import type { Opportunity } from "@/types/database";

import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const pipelineId = searchParams.get("pipeline_id") || "";
    const stageId = searchParams.get("stage_id") || "";

    let query = supabase
      .from("opportunities")
      .select("*, contacts(first_name, last_name)")
      .eq("tenant_id", await getTenantId())
      .order("created_at", { ascending: false });

    if (pipelineId) {
      query = query.eq("pipeline_id", pipelineId);
    }

    if (stageId) {
      query = query.eq("stage_id", stageId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as any[] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const parsed = opportunitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("opportunities")
      .insert({
        ...parsed.data,
        tenant_id: await getTenantId(),
      } as any)
      .select("*, contacts(first_name, last_name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as any }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
