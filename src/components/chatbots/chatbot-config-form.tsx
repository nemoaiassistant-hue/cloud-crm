"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ChatbotConfig } from "@/types/database";

interface ChatbotConfigFormProps {
  chatbot?: ChatbotConfig | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
}

export function ChatbotConfigForm({
  chatbot,
  onSubmit,
  onCancel,
}: ChatbotConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(chatbot?.name ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(
    chatbot?.welcome_message ?? "Hi! How can we help you?"
  );
  const [placeholder, setPlaceholder] = useState(
    chatbot?.placeholder ?? "Type a message..."
  );
  const [primaryColor, setPrimaryColor] = useState(
    chatbot?.primary_color ?? "#6366f1"
  );
  const [position, setPosition] = useState(chatbot?.position ?? "bottom-right");
  const [quickReplies, setQuickReplies] = useState<string[]>(
    chatbot?.quick_replies ?? []
  );
  const [newReply, setNewReply] = useState("");
  const [collectEmail, setCollectEmail] = useState(
    chatbot?.collect_email ?? false
  );
  const [collectName, setCollectName] = useState(
    chatbot?.collect_name ?? false
  );
  const [offlineMessage, setOfflineMessage] = useState(
    chatbot?.offline_message ?? ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        welcome_message: welcomeMessage,
        placeholder,
        primary_color: primaryColor,
        position,
        quick_replies: quickReplies,
        collect_email: collectEmail,
        collect_name: collectName,
        offline_message: offlineMessage || null,
      });
    } finally {
      setLoading(false);
    }
  }

  function addQuickReply() {
    const trimmed = newReply.trim();
    if (trimmed && !quickReplies.includes(trimmed)) {
      setQuickReplies([...quickReplies, trimmed]);
      setNewReply("");
    }
  }

  function removeQuickReply(index: number) {
    setQuickReplies(quickReplies.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Basic Info
        </h3>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Support Bot"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcome_message">Welcome Message</Label>
          <Textarea
            id="welcome_message"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Hi! How can we help you?"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="placeholder">Input Placeholder</Label>
          <Input
            id="placeholder"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            placeholder="Type a message..."
          />
        </div>
      </div>

      <Separator />

      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Appearance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="size-10 cursor-pointer rounded border border-input"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Widget Position</Label>
            <Select value={position} onValueChange={(v: string | null) => v && setPosition(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Replies */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Quick Replies
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, i) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              <span>{reply}</span>
              <button
                type="button"
                onClick={() => removeQuickReply(i)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Add a quick reply..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQuickReply();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addQuickReply}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Data Collection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Data Collection
        </h3>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={collectEmail}
              onChange={(e) => setCollectEmail(e.target.checked)}
              className="rounded border-input"
            />
            Collect Email
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={collectName}
              onChange={(e) => setCollectName(e.target.checked)}
              className="rounded border-input"
            />
            Collect Name
          </label>
        </div>
      </div>

      <Separator />

      {/* Offline Message */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Offline Message
        </h3>
        <div className="space-y-2">
          <Label htmlFor="offline_message">
            Message shown when offline (optional)
          </Label>
          <Textarea
            id="offline_message"
            value={offlineMessage}
            onChange={(e) => setOfflineMessage(e.target.value)}
            placeholder="We're currently offline. Leave your message and we'll get back to you!"
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !name}>
          {loading && <Loader2 className="size-4 animate-spin mr-2" />}
          {chatbot ? "Update Chatbot" : "Create Chatbot"}
        </Button>
      </div>
    </form>
  );
}
