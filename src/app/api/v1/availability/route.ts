import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { AvailabilityRule } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("user_id") || "";

    let query = supabase
      .from("availability_rules")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("day_of_week", { ascending: true });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as AvailabilityRule[] });
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

    // Support single rule or array of rules
    const rules = Array.isArray(body) ? body : [body];

    const insertData = rules.map((rule: Record<string, unknown>) => ({
      tenant_id: tenantId,
      user_id: rule.user_id as string,
      day_of_week: rule.day_of_week as number,
      start_time: rule.start_time as string,
      end_time: rule.end_time as string,
      is_active: rule.is_active !== undefined ? rule.is_active : true,
    }));

    for (const rule of insertData) {
      if (!rule.user_id || rule.day_of_week === undefined || !rule.start_time || !rule.end_time) {
        return NextResponse.json(
          { error: "Missing required fields: user_id, day_of_week, start_time, end_time" },
          { status: 400 }
        );
      }
    }

    // Upsert: if a rule for same user/day already exists, update it
    const { data, error } = await supabase
      .from("availability_rules")
      .upsert(insertData as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
        onConflict: "user_id,day_of_week",
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { data: data as AvailabilityRule[] },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
