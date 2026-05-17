import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

interface UserProfile {
  name: string;
  avatar_url: string | null;
  tenant_id: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile from public users table
  const profileResult = await supabase
    .from("users")
    .select("name, avatar_url, tenant_id")
    .eq("id", user.id)
    .single();

  const profile = (profileResult.data as UserProfile | null) ?? null;

  // Fetch tenant name
  let tenantName = "CloudCRM";
  if (profile?.tenant_id) {
    const tenantResult = await supabase
      .from("tenants")
      .select("name")
      .eq("id", profile.tenant_id)
      .single();
    const tenant = tenantResult.data as { name: string } | null;
    if (tenant?.name) {
      tenantName = tenant.name;
    }
  }

  const userName = profile?.name ?? user.user_metadata?.full_name ?? "User";
  const userEmail = user.email ?? "";
  const userAvatarUrl = profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
        tenantName={tenantName}
      />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
