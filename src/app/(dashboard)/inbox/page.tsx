"use client";

import { useEffect, useState, useCallback } from "react";
import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionList } from "@/components/inbox/session-list";
import { MessageThread } from "@/components/inbox/message-thread";
import type { ChatSession, ChatMessage } from "@/types/database";

export default function InboxPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      // Authenticated: no chatbot_id → uses getTenantId()
      const res = await fetch("/api/v1/chat/sessions");
      if (!res.ok) return;
      const json = await res.json();
      setSessions(json.data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function fetchMessages(sessionId: string) {
    try {
      const res = await fetch(`/api/v1/chat/sessions/${sessionId}/messages`);
      if (!res.ok) return;
      const json = await res.json();
      setMessages(json.data ?? []);
    } catch {
      // ignore
    }
  }

  function handleSelectSession(session: ChatSession) {
    setSelectedSession(session);
    fetchMessages(session.id);
  }

  async function handleSendMessage(content: string) {
    if (!selectedSession) return;

    setSendingMessage(true);
    try {
      const res = await fetch(
        `/api/v1/chat/sessions/${selectedSession.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            sender_type: "agent",
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      await fetchMessages(selectedSession.id);
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleCloseSession() {
    if (!selectedSession) return;

    const res = await fetch(`/api/v1/chat/sessions/${selectedSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });

    if (res.ok) {
      setSelectedSession(null);
      setMessages([]);
      fetchSessions();
    }
  }

  const unreadCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    if (s.status === "unread") {
      acc[s.id] = 1;
    }
    return acc;
  }, {});

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Inbox className="size-5" />
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          {sessions.filter((s) => s.status === "active").length > 0 && (
            <Badge variant="default">
              {sessions.filter((s) => s.status === "active").length} active
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-lg border">
        {/* Session list sidebar */}
        <div className="w-80 shrink-0 border-r overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <SessionList
              sessions={sessions}
              selectedId={selectedSession?.id}
              unreadCounts={unreadCounts}
              onSelect={handleSelectSession}
            />
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1">
          {selectedSession ? (
            <div className="flex h-full flex-col">
              <MessageThread
                session={selectedSession}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
              {selectedSession.status === "active" && (
                <div className="border-t px-4 py-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseSession}
                  >
                    Close Session
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Inbox className="size-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  Select a conversation to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
