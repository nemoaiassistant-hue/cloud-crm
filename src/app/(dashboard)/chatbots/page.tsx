"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChatbotCard } from "@/components/chatbots/chatbot-card";
import { ChatbotConfigForm } from "@/components/chatbots/chatbot-config-form";
import type { ChatbotConfig } from "@/types/database";

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<ChatbotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function fetchChatbots() {
    try {
      const res = await fetch("/api/v1/chatbots");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setChatbots(json.data ?? []);
    } catch (err) {
      console.error("Failed to fetch chatbots:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChatbots();
  }, []);

  async function handleCreate(data: Record<string, unknown>) {
    const res = await fetch("/api/v1/chatbots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create chatbot");
    }

    setDialogOpen(false);
    fetchChatbots();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this chatbot?")) return;

    const res = await fetch(`/api/v1/chatbots/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete chatbot");
      return;
    }
    fetchChatbots();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chatbots</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure chat widgets for your website
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4 mr-2" />
            Create Chatbot
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Chatbot</DialogTitle>
            </DialogHeader>
            <ChatbotConfigForm
              onSubmit={handleCreate}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-lg border bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : chatbots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No chatbots yet</p>
          <p className="text-sm mt-1">
            Create your first chatbot to start engaging with visitors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatbots.map((chatbot) => (
            <ChatbotCard
              key={chatbot.id}
              chatbot={chatbot}
              onClick={() =>
                (window.location.href = `/chatbots/${chatbot.id}`)
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
