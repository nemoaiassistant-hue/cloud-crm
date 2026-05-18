import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formSchema } from "@/lib/validations";
import type { Form } from "@/types/database";
import { getTenantId } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const tenantId = await getTenantId();

    const { data, error } = await supabase
      .from("forms")
      .select("*, form_submissions(count)")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ data: data as Form });
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
    const tenantId = await getTenantId();
    const body = await request.json();

    const parsed = formSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("forms")
      .update(updateData)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Form });
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
    const { id } = await params;
    const tenantId = await getTenantId();

    const { error } = await supabase
      .from("forms")
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
