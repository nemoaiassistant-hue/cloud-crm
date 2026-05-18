import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { Workflow } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { searchParams } = new URL(request.url);

    const isActive = searchParams.get("is_active");
    const triggerType = searchParams.get("trigger_type");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("workflows")
      .select("*, workflow_steps(*)", { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (isActive !== null && isActive !== "") {
      query = query.eq("is_active", isActive === "true");
    }

    if (triggerType) {
      query = query.eq("trigger_type", triggerType);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data as (Workflow & { workflow_steps: unknown[] })[],
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const body = await request.json();

    const { name, description, trigger_type, trigger_config } = body;

    if (!name || !trigger_type) {
      return NextResponse.json(
        { error: "Name and trigger_type are required" },
        { status: 400 }
      );
    }

    const validTriggerTypes = [
      "contact_created",
      "contact_tag_added",
      "opportunity_stage_changed",
      "opportunity_created",
      "task_completed",
      "task_due_soon",
      "form_submitted",
      "chat_message_received",
      "chat_session_created",
    ];

    if (!validTriggerTypes.includes(trigger_type)) {
      return NextResponse.json(
        { error: `Invalid trigger_type. Must be one of: ${validTriggerTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workflows")
      .insert({
        tenant_id: tenantId,
        name,
        description: description || null,
        trigger_type,
        trigger_config: trigger_config || {},
        is_active: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Workflow }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
