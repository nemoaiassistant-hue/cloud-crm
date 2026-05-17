"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ConversationList } from "@/components/conversations/conversation-list";
import { MessageThread } from "@/components/conversations/message-thread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Inbox, Send } from "lucide-react";

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

interface Message {
  id: string;
  content: string;
  direction: string;
  sent_at: string;
  channel: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationWithContact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/v1/conversations");
    if (res.ok) {
      const json = await res.json();
      const convos = json.data as ConversationWithContact[];

      // Enrich with last message and unread count for each conversation
      const enriched = await Promise.all(
        convos.map(async (conv) => {
          try {
            const msgRes = await fetch(
              `/api/v1/conversations/${conv.id}/messages`
            );
            if (msgRes.ok) {
              const msgJson = await msgRes.json();
              const msgs = msgJson.data as Message[];
              const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
              const unreadCount = msgs.filter(
                (m) => m.direction === "inbound"
              ).length;
              return {
                ...conv,
                lastMessage: lastMsg
                  ? {
                      content: lastMsg.content,
                      sent_at: lastMsg.sent_at,
                      direction: lastMsg.direction,
                    }
                  : null,
                unreadCount,
              };
            }
          } catch {
            // ignore
          }
          return conv;
        })
      );
      setConversations(enriched);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!selectedId) return;
    const res = await fetch(`/api/v1/conversations/${selectedId}/messages`);
    if (res.ok) {
      const json = await res.json();
      setMessages(json.data);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [selectedId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !messageInput.trim()) return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/v1/conversations/${selectedId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: messageInput.trim(),
            direction: "outbound",
            channel: "sms",
          }),
        }
      );

      if (res.ok) {
        setMessageInput("");
        fetchMessages();
        fetchConversations();
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
  };

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const contactName = selectedConversation?.contacts
    ? `${selectedConversation.contacts.first_name} ${selectedConversation.contacts.last_name}`
    : null;

  return (
    <div className="flex h-full">
      {/* Left Panel: Conversation List */}
      <div className="w-80 shrink-0 border-r flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Inbox className="size-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">Inbox</h1>
          </div>
          <span className="text-xs text-muted-foreground">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ScrollArea className="flex-1">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
        </ScrollArea>
      </div>

      {/* Right Panel: Message Thread */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedId ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <div>
                <h2 className="text-sm font-semibold">{contactName || "Conversation"}</h2>
                <span className="text-xs text-muted-foreground">
                  {selectedConversation?.channel || "sms"} • {selectedConversation?.status || "open"}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageThread messages={messages} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !messageInput.trim()} size="default">
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
            <Inbox className="size-12" />
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
