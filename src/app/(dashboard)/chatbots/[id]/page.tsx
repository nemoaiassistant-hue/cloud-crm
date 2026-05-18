"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChatbotConfigForm } from "@/components/chatbots/chatbot-config-form";
import { EmbedCodeSnippet } from "@/components/chatbots/embed-code-snippet";
import type { ChatbotConfig } from "@/types/database";

export default function ChatbotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [chatbot, setChatbot] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChatbot() {
      try {
        const res = await fetch(`/api/v1/chatbots/${chatbotId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setChatbot(json.data);
      } catch (err) {
        console.error("Failed to fetch chatbot:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChatbot();
  }, [chatbotId]);

  async function handleUpdate(data: Record<string, unknown>) {
    const res = await fetch(`/api/v1/chatbots/${chatbotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update chatbot");
    }

    const json = await res.json();
    setChatbot(json.data);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-[500px] rounded-lg border bg-muted animate-pulse" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium">Chatbot not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/chatbots")}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/chatbots")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Chatbot
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {chatbot.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatbotConfigForm chatbot={chatbot} onSubmit={handleUpdate} />
        </div>
        <div className="space-y-6">
          <EmbedCodeSnippet chatbotId={chatbot.id} />
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Details</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>ID: {chatbot.id}</p>
              <p>Created: {new Date(chatbot.created_at).toLocaleDateString()}</p>
              <p>Updated: {new Date(chatbot.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
