"use client";

import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface ConversationWithContact {
  id: string;
  contact_id: string;
  channel: string;
  status: string;
  created_at: string;
  contacts: {
    first_name: string;
    last_name: string;
  } | null;
  lastMessage?: {
    content: string;
    sent_at: string;
    direction: string;
  } | null;
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: ConversationWithContact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
        <MessageCircle className="size-8 mb-2" />
        <span className="text-sm">No conversations yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => {
        const contactName = conv.contacts
          ? `${conv.contacts.first_name} ${conv.contacts.last_name}`
          : "Unknown";
        const isSelected = conv.id === selectedId;
        const lastMsg = conv.lastMessage;
        const timeStr = lastMsg
          ? new Date(lastMsg.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date(conv.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex flex-col gap-0.5 p-3 text-left transition-colors border-b border-border/50 hover:bg-muted/50",
              isSelected && "bg-muted"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{contactName}</span>
              <div className="flex items-center gap-1.5">
                {(conv.unreadCount ?? 0) > 0 && (
                  <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                    {conv.unreadCount}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {timeStr}
                </span>
              </div>
            </div>
            {lastMsg && (
              <span className="text-xs text-muted-foreground truncate">
                {lastMsg.direction === "outbound" && "You: "}
                {lastMsg.content}
              </span>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-muted-foreground bg-muted rounded px-1 py-0">
                {conv.channel}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
