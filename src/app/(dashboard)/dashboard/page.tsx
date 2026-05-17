import { createClient } from "@/lib/supabase/server";
import {
  Users,
  TrendingUp,
  CheckSquare,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Pipeline stages for the overview bars
const PIPELINE_STAGES = [
  { name: "Lead", color: "bg-blue-500" },
  { name: "Qualified", color: "bg-indigo-500" },
  { name: "Proposal", color: "bg-violet-500" },
  { name: "Negotiation", color: "bg-purple-500" },
  { name: "Closed Won", color: "bg-emerald-500" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch the user's profile to get tenant_id
  const profileResult = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  const profile = profileResult.data as { tenant_id: string } | null;
  const tenantId = profile?.tenant_id;

  // Parallel data fetches for dashboard summary
  const [contactsResult, opportunitiesResult, tasksResult, conversationsResult, activityResult] =
    tenantId
      ? await Promise.all([
          supabase.from("contacts").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
          supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "active"),
          supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).neq("status", "completed"),
          supabase.from("conversations").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "open"),
          supabase.from("activity_log").select("action, details, created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(8),
        ])
      : [];

  const totalContacts = (contactsResult as { count: number | null } | undefined)?.count ?? 0;
  const activeOpportunities = (opportunitiesResult as { count: number | null } | undefined)?.count ?? 0;
  const openTasks = (tasksResult as { count: number | null } | undefined)?.count ?? 0;
  const openMessages = (conversationsResult as { count: number | null } | undefined)?.count ?? 0;

  type ActivityEntry = { action: string; details: Record<string, unknown> | null; created_at: string };
  const recentActivity = ((activityResult as { data: ActivityEntry[] | null } | undefined)?.data ?? []) as ActivityEntry[];

  // Fetch pipeline stage counts for the bar chart
  let stageCounts: { name: string; count: number; color: string }[] = PIPELINE_STAGES.map((s) => ({
    ...s,
    count: 0,
  }));

  if (tenantId) {
    // Get all active opportunities with their stage info
    const { data: opps } = (await supabase
      .from("opportunities")
      .select("stage_id, status")
      .eq("tenant_id", tenantId)
      .eq("status", "active")) as { data: { stage_id: string; status: string }[] | null };

    if (opps && opps.length > 0) {
      const stageIds = [...new Set(opps.map((o) => o.stage_id))];
      const { data: stages } = (await supabase
        .from("pipeline_stages")
        .select("id, name")
        .in("id", stageIds)) as { data: { id: string; name: string }[] | null };

      if (stages) {
        const stageMap = new Map(stages.map((s) => [s.id, s.name]));
        const counts = new Map<string, number>();
        opps.forEach((o) => {
          const name = stageMap.get(o.stage_id) ?? "Unknown";
          counts.set(name, (counts.get(name) ?? 0) + 1);
        });

        stageCounts = PIPELINE_STAGES.map((s) => ({
          ...s,
          count: counts.get(s.name) ?? 0,
        }));
        // Add any stages from DB that aren't in our default list
        counts.forEach((count, name) => {
          if (!PIPELINE_STAGES.find((s) => s.name === name)) {
            stageCounts.push({ name, count, color: "bg-gray-400" });
          }
        });
      }
    }
  }

  const maxStageCount = Math.max(...stageCounts.map((s) => s.count), 1);

  // Summary card data
  const summaryCards = [
    {
      label: "Total Contacts",
      value: totalContacts,
      icon: Users,
      trend: "+12%",
    },
    {
      label: "Active Opportunities",
      value: activeOpportunities,
      icon: TrendingUp,
      trend: "+8%",
    },
    {
      label: "Open Tasks",
      value: openTasks,
      icon: CheckSquare,
      trend: null,
    },
    {
      label: "Messages",
      value: openMessages,
      icon: MessageSquare,
      trend: "+3%",
    },
  ];

  function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your CRM activity
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} size="sm">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <card.icon className="size-4 text-muted-foreground" />
                {card.label}
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
            </CardHeader>
            {card.trend && (
              <CardContent className="-mt-2">
                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                  <ArrowUpRight className="size-3" />
                  {card.trend}
                </span>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
            <CardDescription>
              Active opportunities by stage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stageCounts.map((stage) => (
              <div key={stage.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {stage.count}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${stage.color}`}
                    style={{
                      width: `${Math.max((stage.count / maxStageCount) * 100, stage.count > 0 ? 4 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {stageCounts.every((s) => s.count === 0) && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No active opportunities yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across your CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {formatActionLabel(entry.action, entry.details)}
                      </span>
                      {entry.details && (
                        <span className="text-xs text-muted-foreground truncate">
                          {formatDetailSummary(entry.details)}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(entry.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Convert action codes into human-readable labels */
function formatActionLabel(
  action: string,
  _details: Record<string, unknown> | null
): string {
  const labels: Record<string, string> = {
    contact_created: "New contact added",
    contact_updated: "Contact updated",
    opportunity_created: "New opportunity created",
    opportunity_stage_changed: "Opportunity moved to new stage",
    opportunity_won: "Deal closed — won!",
    opportunity_lost: "Deal closed — lost",
    task_created: "Task created",
    task_completed: "Task completed",
    message_sent: "Message sent",
    message_received: "Message received",
  };
  return labels[action] ?? action.replace(/_/g, " ");
}

/** Pull a short detail string from the JSON blob */
function formatDetailSummary(details: Record<string, unknown>): string {
  if (typeof details.contact_name === "string") return details.contact_name;
  if (typeof details.opportunity_name === "string") return details.opportunity_name;
  if (typeof details.task_title === "string") return details.task_title;
  if (typeof details.stage_name === "string") return `Stage: ${details.stage_name}`;
  return "";
}
