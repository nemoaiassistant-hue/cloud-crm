"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  direction: string;
  sent_at: string;
  channel: string;
}

interface MessageThreadProps {
  messages: Message[];
}

export function MessageThread({ messages }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="flex flex-col gap-3">
        {messages.map((msg) => {
          const isInbound = msg.direction === "inbound";
          const time = new Date(msg.sent_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={cn(
                "flex max-w-[75%]",
                isInbound ? "self-start" : "self-end"
              )}
            >
              <div
                className={cn(
                  "px-3 py-2 rounded-xl text-sm",
                  isInbound
                    ? "bg-muted text-foreground rounded-tl-none"
                    : "bg-primary text-primary-foreground rounded-tr-none"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <span
                  className={cn(
                    "text-[10px] mt-1 block",
                    isInbound
                      ? "text-muted-foreground"
                      : "text-primary-foreground/70"
                  )}
                >
                  {time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
