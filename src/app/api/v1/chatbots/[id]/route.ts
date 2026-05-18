import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/auth";
import type { ChatbotConfig } from "@/types/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const tenant_id = await getTenantId();

    const { data, error } = await supabase
      .from("chatbot_configs")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: data as ChatbotConfig });
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
    const { id } = await params;
    const tenant_id = await getTenantId();
    const body = await request.json();

    const allowedFields = [
      "name",
      "welcome_message",
      "placeholder",
      "primary_color",
      "position",
      "avatar_url",
      "quick_replies",
      "collect_email",
      "collect_name",
      "offline_message",
      "business_hours",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chatbot_configs")
      .update(updateData)
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: data as ChatbotConfig });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const tenant_id = await getTenantId();

    const { error } = await supabase
      .from("chatbot_configs")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenant_id);

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
