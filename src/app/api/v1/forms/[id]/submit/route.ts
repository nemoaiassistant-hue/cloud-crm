import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formSubmissionSchema } from "@/lib/validations";
import type { FormSubmission } from "@/types/database";

// PUBLIC endpoint — no auth required. Used for embedded forms.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: formId } = await params;
    const body = await request.json();

    const parsed = formSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify the form exists and is active
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, tenant_id, is_active, fields")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (!form.is_active) {
      return NextResponse.json({ error: "Form is no longer accepting submissions" }, { status: 400 });
    }

    // Validate required fields
    const fields = (form.fields as Array<{ id: string; label: string; required?: boolean }>) || [];
    for (const field of fields) {
      if (field.required && !parsed.data.data[field.id]) {
        return NextResponse.json(
          { error: `Field "${field.label}" is required` },
          { status: 400 }
        );
      }
    }

    // Get IP address from request headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : null;

    let contactId: string | null = null;

    // Optionally create a contact
    if (parsed.data.create_contact) {
      const formData = parsed.data.data;
      const email = (formData.email as string) || null;
      const phone = (formData.phone as string) || null;

      // Check for existing contact by email
      if (email) {
        const { data: existingContact } = await supabase
          .from("contacts")
          .select("id")
          .eq("tenant_id", form.tenant_id)
          .eq("email", email)
          .maybeSingle();

        if (existingContact) {
          contactId = existingContact.id;
        }
      }

      if (!contactId) {
        // Build name from form data
        const firstName = (formData.first_name as string) || (formData.name as string)?.split(" ")[0] || "Unknown";
        const lastName = (formData.last_name as string) || (formData.name as string)?.split(" ").slice(1).join(" ") || "Lead";

        const { data: newContact, error: contactError } = await supabase
          .from("contacts")
          .insert({
            tenant_id: form.tenant_id,
            first_name: firstName,
            last_name: lastName || "Lead",
            email,
            phone,
            source: "form",
            status: "lead",
          } as any)
          .select("id")
          .single();

        if (!contactError && newContact) {
          contactId = newContact.id;
        }
      }
    }

    // Create the submission
    const { data, error } = await supabase
      .from("form_submissions")
      .insert({
        tenant_id: form.tenant_id,
        form_id: formId,
        contact_id: contactId,
        data: parsed.data.data,
        source: parsed.data.source || "embed",
        ip_address: ipAddress,
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as FormSubmission }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
