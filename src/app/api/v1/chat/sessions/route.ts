import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { ChatSession } from "@/types/database";

// Supports two modes:
// 1. Tenant-authenticated (no chatbot_id): lists all sessions for the tenant
// 2. Public (with chatbot_id): lists sessions for a specific chatbot (used by widget)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const chatbot_id = searchParams.get("chatbot_id");
    const status = searchParams.get("status") || "";
    const visitor_email = searchParams.get("visitor_email") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let tenant_id: string;

    if (chatbot_id) {
      // PUBLIC mode: look up tenant_id from chatbot_id
      const { data: chatbot, error: cbError } = await supabase
        .from("chatbot_configs")
        .select("tenant_id")
        .eq("id", chatbot_id)
        .single();

      if (cbError || !chatbot) {
        return NextResponse.json(
          { error: "Chatbot not found" },
          { status: 404 }
        );
      }
      tenant_id = chatbot.tenant_id;
    } else {
      // Authenticated mode: use tenant from auth
      tenant_id = await getTenantId();
    }

    let query = supabase
      .from("chat_sessions")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenant_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (chatbot_id) {
      query = query.eq("chatbot_id", chatbot_id);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (visitor_email) {
      query = query.eq("visitor_email", visitor_email);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data as ChatSession[],
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

// PUBLIC endpoint — creates a chat session from the embed widget
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { chatbot_id, visitor_name, visitor_email, visitor_ip, source } =
      body;

    if (!chatbot_id) {
      return NextResponse.json(
        { error: "chatbot_id is required" },
        { status: 400 }
      );
    }

    // Look up tenant_id from chatbot_id
    const { data: chatbot, error: cbError } = await supabase
      .from("chatbot_configs")
      .select("tenant_id")
      .eq("id", chatbot_id)
      .single();

    if (cbError || !chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        tenant_id: chatbot.tenant_id,
        chatbot_id,
        visitor_name: visitor_name ?? null,
        visitor_email: visitor_email ?? null,
        visitor_ip: visitor_ip ?? null,
        source: source ?? "widget",
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as ChatSession }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
