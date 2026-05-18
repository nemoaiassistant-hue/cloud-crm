"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  CheckSquare,
  MessageSquare,
  CalendarDays,
  Bot,
  Inbox,
  Zap,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Pipelines", href: "/pipelines", icon: GitBranch },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Conversations", href: "/conversations", icon: MessageSquare },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Chatbots", href: "/chatbots", icon: Bot },
  { label: "Workflows", href: "/workflows", icon: Zap },
  { label: "Forms", href: "/forms", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string | null;
  tenantName?: string;
}

export function Sidebar({
  userName = "User",
  userEmail = "",
  userAvatarUrl,
  tenantName = "CloudCRM",
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Tenant header */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight">
            {tenantName}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("ml-auto shrink-0", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-muted",
                collapsed && "justify-center px-0"
              )}
            >
              <Avatar size="sm">
                {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {userName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
            >
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
