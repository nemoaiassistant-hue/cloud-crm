import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { ChatMessage } from "@/types/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: sessionId } = await params;
    const tenant_id = await getTenantId();

    // Verify the session belongs to this tenant
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("tenant_id", tenant_id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { data, error, count } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact" })
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data as ChatMessage[],
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: sessionId } = await params;
    const tenant_id = await getTenantId();
    const body = await request.json();

    const { content, sender_type, sender_id } = body;

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    // Verify the session belongs to this tenant
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("tenant_id", tenant_id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        tenant_id,
        sender_type: sender_type ?? "agent",
        sender_id: sender_id ?? null,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as ChatMessage }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
