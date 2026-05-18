import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Conversation } from "@/types/database";

import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || "";
    const channel = searchParams.get("channel") || "";

    let query = supabase
      .from("conversations")
      .select("*, contacts(first_name, last_name)")
      .eq("tenant_id", await getTenantId())
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }
    if (channel) {
      query = query.eq("channel", channel);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as any[] });
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

    if (!body.contact_id) {
      return NextResponse.json(
        { error: "Validation failed", details: { contact_id: ["Contact is required"] } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        tenant_id: await getTenantId(),
        contact_id: body.contact_id,
        channel: body.channel || "sms",
        status: body.status || "open",
      } as any)
      .select("*, contacts(first_name, last_name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as any }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
