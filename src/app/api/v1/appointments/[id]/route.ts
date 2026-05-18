import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { Appointment } from "@/types/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { id } = await params;

    const { data, error } = await supabase
      .from("appointments")
      .select(
        "*, appointment_types(id, name, color, duration_minutes), contacts(id, first_name, last_name, email), users:assigned_to(id, name, email)"
      )
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: data as Appointment });
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

    const allowedFields = [
      "appointment_type_id",
      "contact_id",
      "assigned_to",
      "title",
      "description",
      "start_time",
      "end_time",
      "status",
      "location",
      "notes",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("appointments")
      .update(updateData as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select(
        "*, appointment_types(id, name, color, duration_minutes), contacts(id, first_name, last_name, email), users:assigned_to(id, name, email)"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Appointment });
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

    const { error } = await supabase
      .from("appointments")
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
