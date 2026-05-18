import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { Appointment } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";
    const assignedTo = searchParams.get("assigned_to") || "";
    const status = searchParams.get("status") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("appointments")
      .select(
        "*, appointment_types(id, name, color, duration_minutes), contacts(id, first_name, last_name, email), users:assigned_to(id, name, email)",
        { count: "exact" }
      )
      .eq("tenant_id", tenantId)
      .order("start_time", { ascending: true })
      .range(offset, offset + limit - 1);

    if (startDate) {
      query = query.gte("start_time", startDate);
    }
    if (endDate) {
      query = query.lte("start_time", endDate);
    }
    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
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

    const {
      appointment_type_id,
      contact_id,
      assigned_to,
      title,
      description,
      start_time,
      end_time,
      status,
      location,
      notes,
    } = body;

    if (!appointment_type_id || !assigned_to || !title || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Missing required fields: appointment_type_id, assigned_to, title, start_time, end_time" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        tenant_id: tenantId,
        appointment_type_id,
        contact_id: contact_id || null,
        assigned_to,
        title,
        description: description || null,
        start_time,
        end_time,
        status: status || "scheduled",
        location: location || null,
        notes: notes || null,
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select(
        "*, appointment_types(id, name, color, duration_minutes), contacts(id, first_name, last_name, email), users:assigned_to(id, name, email)"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Appointment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
