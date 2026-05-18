"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatSession } from "@/types/database";

interface MessageThreadProps {
  session: ChatSession;
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
}

export function MessageThread({
  session,
  messages,
  onSendMessage,
}: MessageThreadProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");
    try {
      await onSendMessage(content);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {(session.visitor_name || "A")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {session.visitor_name || "Anonymous Visitor"}
            </p>
            <p className="text-xs text-muted-foreground">
              {session.visitor_email || session.source || "No email"}
            </p>
          </div>
        </div>
        <Badge
          variant={session.status === "active" ? "default" : "secondary"}
        >
          {session.status}
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((msg) => {
            const isVisitor = msg.sender_type === "visitor";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  isVisitor ? "justify-start" : "justify-end"
                )}
              >
                {isVisitor && (
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="text-xs bg-muted">
                      {(session.visitor_name || "V")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                    isVisitor
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isVisitor
                        ? "text-muted-foreground"
                        : "text-primary-foreground/70"
                    )}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
                {!isVisitor && (
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      A
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      {session.status === "active" ? (
        <div className="border-t p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sending || !input.trim()}>
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      ) : (
        <div className="border-t p-3 text-center">
          <p className="text-sm text-muted-foreground">
            This session is closed
          </p>
        </div>
      )}
    </div>
  );
}
