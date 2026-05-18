import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { WorkflowStep } from "@/types/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { id: workflowId } = await params;
    const body = await request.json();

    const { action_type, action_config } = body;

    if (!action_type) {
      return NextResponse.json(
        { error: "action_type is required" },
        { status: 400 }
      );
    }

    const validActionTypes = [
      "send_email",
      "create_task",
      "add_tag",
      "remove_tag",
      "update_contact",
      "move_opportunity",
      "send_sms",
      "notify_user",
      "wait",
      "webhook",
    ];

    if (!validActionTypes.includes(action_type)) {
      return NextResponse.json(
        { error: `Invalid action_type. Must be one of: ${validActionTypes.join(", ")}` },
        { status: 400 }
      );
    }

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

    // Get current max step order
    const { data: existingSteps } = await supabase
      .from("workflow_steps")
      .select("step_order")
      .eq("workflow_id", workflowId)
      .order("step_order", { ascending: false })
      .limit(1);

    const nextOrder = existingSteps && existingSteps.length > 0
      ? (existingSteps[0] as { step_order: number }).step_order + 1
      : 0;

    const { data, error } = await supabase
      .from("workflow_steps")
      .insert({
        workflow_id: workflowId,
        step_order: nextOrder,
        action_type,
        action_config: action_config || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as WorkflowStep }, { status: 201 });
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
    const tenantId = await getTenantId();
    const { id: workflowId } = await params;
    const body = await request.json();

    // Expect { step_ids: string[] } — an ordered array of step IDs
    const { step_ids } = body;

    if (!Array.isArray(step_ids)) {
      return NextResponse.json(
        { error: "step_ids must be an array of step IDs in desired order" },
        { status: 400 }
      );
    }

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

    // Update each step's order
    const updates = step_ids.map((stepId: string, index: number) =>
      supabase
        .from("workflow_steps")
        .update({ step_order: index })
        .eq("id", stepId)
        .eq("workflow_id", workflowId)
    );

    await Promise.all(updates);

    // Return updated steps
    const { data, error } = await supabase
      .from("workflow_steps")
      .select("*")
      .eq("workflow_id", workflowId)
      .order("step_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as WorkflowStep[] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
