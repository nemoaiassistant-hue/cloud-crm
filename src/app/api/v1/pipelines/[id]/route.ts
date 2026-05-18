import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pipelineSchema } from "@/lib/validations";
import type { Pipeline } from "@/types/database";

import { getTenantId } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("pipelines")
      .select("*, pipeline_stages(*)")
      .eq("id", id)
      .eq("tenant_id", await getTenantId())
      .single() as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Sort stages
    const result = data as Record<string, any>;
    result.pipeline_stages = (result.pipeline_stages || []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    );

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const parsed = pipelineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pipelines")
      .update(parsed.data as any)
      .eq("id", id)
      .eq("tenant_id", await getTenantId())
      .select()
      .single() as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Pipeline });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
      .from("pipelines")
      .delete()
      .eq("id", id)
      .eq("tenant_id", await getTenantId());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
