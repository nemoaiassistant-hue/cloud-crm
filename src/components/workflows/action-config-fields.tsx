"use client";

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

interface ActionConfigFieldsProps {
  actionType: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export default function ActionConfigFields({
  actionType,
  config,
  onChange,
}: ActionConfigFieldsProps) {
  const updateField = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  switch (actionType) {
    case "send_email":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>To</Label>
            <Input
              placeholder="recipient@example.com or {{contact.email}}"
              value={(config.to as string) || ""}
              onChange={(e) => updateField("to", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Subject</Label>
            <Input
              placeholder="Email subject line"
              value={(config.subject as string) || ""}
              onChange={(e) => updateField("subject", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Body</Label>
            <Textarea
              placeholder="Email body content..."
              rows={4}
              value={(config.body as string) || ""}
              onChange={(e) => updateField("body", e.target.value)}
            />
          </div>
        </div>
      );

    case "create_task":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              placeholder="Task title"
              value={(config.title as string) || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              placeholder="Task description..."
              rows={3}
              value={(config.description as string) || ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Priority</Label>
            <Select
              value={(config.priority as string) || "medium"}
              onValueChange={(v: string | null) => { if (v) updateField("priority", v); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Assign To (User ID, optional)</Label>
            <Input
              placeholder="User ID or leave empty"
              value={(config.assigned_to as string) || ""}
              onChange={(e) => updateField("assigned_to", e.target.value)}
            />
          </div>
        </div>
      );

    case "add_tag":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Tag Name</Label>
            <Input
              placeholder="e.g. vip, follow-up, qualified"
              value={(config.tag as string) || ""}
              onChange={(e) => updateField("tag", e.target.value)}
            />
          </div>
        </div>
      );

    case "remove_tag":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Tag Name</Label>
            <Input
              placeholder="e.g. cold-lead, unqualified"
              value={(config.tag as string) || ""}
              onChange={(e) => updateField("tag", e.target.value)}
            />
          </div>
        </div>
      );

    case "update_contact":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Field to Update</Label>
            <Select
              value={(config.field as string) || ""}
              onValueChange={(v: string | null) => { if (v) updateField("field", v); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="first_name">First Name</SelectItem>
                <SelectItem value="last_name">Last Name</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>New Value</Label>
            <Input
              placeholder="New value for the field"
              value={(config.value as string) || ""}
              onChange={(e) => updateField("value", e.target.value)}
            />
          </div>
        </div>
      );

    case "move_opportunity":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Target Stage ID</Label>
            <Input
              placeholder="UUID of the pipeline stage"
              value={(config.stage_id as string) || ""}
              onChange={(e) => updateField("stage_id", e.target.value)}
            />
          </div>
        </div>
      );

    case "send_sms":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>To</Label>
            <Input
              placeholder="+1234567890 or {{contact.phone}}"
              value={(config.to as string) || ""}
              onChange={(e) => updateField("to", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Message</Label>
            <Textarea
              placeholder="SMS message content..."
              rows={3}
              value={(config.message as string) || ""}
              onChange={(e) => updateField("message", e.target.value)}
            />
          </div>
        </div>
      );

    case "notify_user":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>User ID</Label>
            <Input
              placeholder="UUID of the user to notify"
              value={(config.user_id as string) || ""}
              onChange={(e) => updateField("user_id", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Message</Label>
            <Textarea
              placeholder="Notification message..."
              rows={3}
              value={(config.message as string) || ""}
              onChange={(e) => updateField("message", e.target.value)}
            />
          </div>
        </div>
      );

    case "wait":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="e.g. 5, 30, 60"
              value={(config.duration_minutes as string) || ""}
              onChange={(e) => updateField("duration_minutes", e.target.value)}
            />
          </div>
        </div>
      );

    case "webhook":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>URL</Label>
            <Input
              placeholder="https://example.com/webhook"
              value={(config.url as string) || ""}
              onChange={(e) => updateField("url", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Method</Label>
            <Select
              value={(config.method as string) || "POST"}
              onValueChange={(v: string | null) => { if (v) updateField("method", v); }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Headers (JSON)</Label>
            <Textarea
              placeholder='{"Authorization": "Bearer ..."}'
              rows={2}
              value={(config.headers as string) || ""}
              onChange={(e) => updateField("headers", e.target.value)}
            />
          </div>
        </div>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          No configuration needed for this action type.
        </p>
      );
  }
}
