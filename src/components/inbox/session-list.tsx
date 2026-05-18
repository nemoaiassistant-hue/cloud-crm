"use client";

import { MessageSquare, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/types/database";

interface SessionListProps {
  sessions: ChatSession[];
  selectedId?: string;
  unreadCounts?: Record<string, number>;
  onSelect: (session: ChatSession) => void;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  closed: "bg-gray-400",
  unread: "bg-blue-500",
};

const statusBadgeVariants: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  closed: "secondary",
  unread: "outline",
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function SessionList({
  sessions,
  selectedId,
  unreadCounts = {},
  onSelect,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <MessageSquare className="size-8 mb-2" />
        <p className="text-sm">No chat sessions yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {sessions.map((session) => {
        const unread = unreadCounts[session.id] ?? 0;
        const isSelected = selectedId === session.id;

        return (
          <button
            key={session.id}
            onClick={() => onSelect(session)}
            className={cn(
              "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
              isSelected && "bg-muted"
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">
                  {session.visitor_name || "Anonymous Visitor"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {unread > 0 && (
                    <Badge variant="default" className="size-5 p-0 flex items-center justify-center text-[10px]">
                      {unread}
                    </Badge>
                  )}
                  <Circle
                    className={cn(
                      "size-2",
                      statusColors[session.status] ?? "bg-gray-400"
                    )}
                    fill="currentColor"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant={statusBadgeVariants[session.status] ?? "outline"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {session.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {session.visitor_email && `${session.visitor_email} · `}
                  {timeAgo(session.created_at)}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
