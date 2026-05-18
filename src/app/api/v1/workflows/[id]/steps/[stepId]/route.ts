import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { WorkflowStep } from "@/types/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { id: workflowId, stepId } = await params;
    const body = await request.json();

    // Verify workflow belongs to tenant
    const { data: workflow } = await supabase
      .from("workflows")
      .select("id")
      .eq("id", workflowId)
      .eq("tenant_id", tenantId)
      .single();

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const allowedFields = ["action_type", "action_config", "step_order"];
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

    const { data, error } = await supabase
      .from("workflow_steps")
      .update(updates)
      .eq("id", stepId)
      .eq("workflow_id", workflowId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    return NextResponse.json({ data: data as WorkflowStep });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { id: workflowId, stepId } = await params;

    // Verify workflow belongs to tenant
    const { data: workflow } = await supabase
      .from("workflows")
      .select("id")
      .eq("id", workflowId)
      .eq("tenant_id", tenantId)
      .single();

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("workflow_steps")
      .delete()
      .eq("id", stepId)
      .eq("workflow_id", workflowId);

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
