import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { Workflow, WorkflowStep } from "@/types/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { id } = await params;

    const { data, error } = await supabase
      .from("workflows")
      .select("*, workflow_steps(*)")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: data as Workflow & { workflow_steps: WorkflowStep[] },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { id } = await params;
    const body = await request.json();

    const allowedFields = ["name", "description", "trigger_type", "trigger_config"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    if (updates.trigger_type) {
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

      if (!validTriggerTypes.includes(updates.trigger_type as string)) {
        return NextResponse.json(
          { error: "Invalid trigger_type" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("workflows")
      .update(updates)
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { id } = await params;

    // Delete steps first (cascade should handle this, but be safe)
    await supabase
      .from("workflow_steps")
      .delete()
      .eq("workflow_id", id);

    const { error } = await supabase
      .from("workflows")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

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
