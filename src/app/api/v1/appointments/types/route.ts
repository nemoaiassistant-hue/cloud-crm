import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { AppointmentType } from "@/types/database";

export async function GET() {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();

    const { data, error } = await supabase
      .from("appointment_types")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as AppointmentType[] });
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

    const { name, description, duration_minutes, color, is_active, buffer_minutes } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("appointment_types")
      .insert({
        tenant_id: tenantId,
        name,
        description: description || null,
        duration_minutes: duration_minutes || 30,
        color: color || "#3B82F6",
        is_active: is_active !== undefined ? is_active : true,
        buffer_minutes: buffer_minutes || 0,
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as AppointmentType }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
