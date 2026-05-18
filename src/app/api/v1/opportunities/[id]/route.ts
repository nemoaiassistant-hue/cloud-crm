import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { opportunitySchema } from "@/lib/validations";

import { getTenantId } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("opportunities")
      .select("*, contacts(first_name, last_name)")
      .eq("id", id)
      .eq("tenant_id", await getTenantId())
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    // Allow partial updates for drag-drop (stage_id only) or full edits
    const allowedFields: Record<string, any> = {};
    if (body.stage_id !== undefined) allowedFields.stage_id = body.stage_id;
    if (body.name !== undefined) allowedFields.name = body.name;
    if (body.value !== undefined) allowedFields.value = body.value;
    if (body.status !== undefined) allowedFields.status = body.status;
    if (body.assigned_to !== undefined) allowedFields.assigned_to = body.assigned_to;
    if (body.contact_id !== undefined) allowedFields.contact_id = body.contact_id;

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("opportunities")
      .update({
        ...allowedFields,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", id)
      .eq("tenant_id", await getTenantId())
      .select("*, contacts(first_name, last_name)")
      .single() as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
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
      .from("opportunities")
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
