import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pipelineSchema } from "@/lib/validations";
import type { Pipeline } from "@/types/database";

import { getTenantId } from "@/lib/auth";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pipelines")
      .select("*, pipeline_stages(*)")
      .eq("tenant_id", await getTenantId())
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sort stages within each pipeline
    const sorted = (data as any[]).map((p) => ({
      ...p,
      pipeline_stages: (p.pipeline_stages || []).sort(
        (a: any, b: any) => a.sort_order - b.sort_order
      ),
    }));

    return NextResponse.json({ data: sorted });
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

    const parsed = pipelineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pipelines")
      .insert({
        ...parsed.data,
        tenant_id: await getTenantId(),
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Pipeline }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
