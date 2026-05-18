import { createClient } from "@/lib/supabase/server";

export async function getTenantId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    throw new Error("User profile not found");
  }

  return profile.tenant_id;
}
