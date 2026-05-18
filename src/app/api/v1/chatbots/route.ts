import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { ChatbotConfig } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { data, error, count } = await supabase
      .from("chatbot_configs")
      .select("*", { count: "exact" })
      .eq("tenant_id", await getTenantId())
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data as ChatbotConfig[],
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
    const tenant_id = await getTenantId();
    const body = await request.json();

    const {
      name,
      welcome_message,
      placeholder,
      primary_color,
      position,
      avatar_url,
      quick_replies,
      collect_email,
      collect_name,
      offline_message,
      business_hours,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Validation failed", details: { name: ["Name is required"] } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chatbot_configs")
      .insert({
        tenant_id,
        name,
        welcome_message: welcome_message ?? "Hi! How can we help you?",
        placeholder: placeholder ?? "Type a message...",
        primary_color: primary_color ?? "#6366f1",
        position: position ?? "bottom-right",
        avatar_url: avatar_url ?? null,
        quick_replies: quick_replies ?? [],
        collect_email: collect_email ?? false,
        collect_name: collect_name ?? false,
        offline_message: offline_message ?? null,
        business_hours: business_hours ?? {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as ChatbotConfig }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
