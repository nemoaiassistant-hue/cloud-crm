"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Tag,
  ArrowRightLeft,
  Briefcase,
  CheckSquare,
  Clock,
  FileText,
  MessageSquare,
  MessageCircle,
  Zap,
} from "lucide-react";

const triggerOptions = [
  { value: "contact_created", label: "Contact Created", icon: UserPlus },
  { value: "contact_tag_added", label: "Tag Added to Contact", icon: Tag },
  { value: "opportunity_stage_changed", label: "Opportunity Stage Changed", icon: ArrowRightLeft },
  { value: "opportunity_created", label: "Opportunity Created", icon: Briefcase },
  { value: "task_completed", label: "Task Completed", icon: CheckSquare },
  { value: "task_due_soon", label: "Task Due Soon", icon: Clock },
  { value: "form_submitted", label: "Form Submitted", icon: FileText },
  { value: "chat_message_received", label: "Chat Message Received", icon: MessageSquare },
  { value: "chat_session_created", label: "Chat Session Created", icon: MessageCircle },
];

interface TriggerSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function TriggerSelector({ value, onChange, disabled }: TriggerSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Trigger
      </Label>
      <Select value={value} onValueChange={(v: string | null) => { if (v) onChange(v); }} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a trigger..." />
        </SelectTrigger>
        <SelectContent>
          {triggerOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {option.label}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
