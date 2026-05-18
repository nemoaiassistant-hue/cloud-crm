import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validations";
import type { Task } from "@/types/database";

import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const assignedTo = searchParams.get("assigned_to") || "";
    const contactId = searchParams.get("contact_id") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("tasks")
      .select("*, contacts(id, first_name, last_name)", { count: "exact" })
      .eq("tenant_id", await getTenantId())
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo);
    }

    if (contactId) {
      query = query.eq("contact_id", contactId);
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
    const body = await request.json();

    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const insertData = {
      ...parsed.data,
      tenant_id: await getTenantId(),
    } as Record<string, unknown>;

    const { data, error } = await supabase
      .from("tasks")
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Task }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
