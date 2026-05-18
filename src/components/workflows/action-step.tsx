"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  ListPlus,
  Plus,
  Minus,
  UserPen,
  ArrowRightLeft,
  Phone,
  Bell,
  Timer,
  Globe,
  GripVertical,
  Trash2,
} from "lucide-react";
import ActionConfigFields from "./action-config-fields";
import type { WorkflowStep } from "@/types/database";

const actionOptions = [
  { value: "send_email", label: "Send Email", icon: Mail },
  { value: "create_task", label: "Create Task", icon: ListPlus },
  { value: "add_tag", label: "Add Tag", icon: Plus },
  { value: "remove_tag", label: "Remove Tag", icon: Minus },
  { value: "update_contact", label: "Update Contact", icon: UserPen },
  { value: "move_opportunity", label: "Move Opportunity", icon: ArrowRightLeft },
  { value: "send_sms", label: "Send SMS", icon: Phone },
  { value: "notify_user", label: "Notify User", icon: Bell },
  { value: "wait", label: "Wait", icon: Timer },
  { value: "webhook", label: "Webhook", icon: Globe },
];

interface ActionStepProps {
  step: WorkflowStep;
  stepNumber: number;
  onActionTypeChange: (stepId: string, actionType: string) => void;
  onConfigChange: (stepId: string, config: Record<string, unknown>) => void;
  onRemove: (stepId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function ActionStep({
  step,
  stepNumber,
  onActionTypeChange,
  onConfigChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ActionStepProps) {
  const currentAction = actionOptions.find((a) => a.value === step.action_type);
  const ActionIcon = currentAction?.icon || Globe;

  return (
    <Card className="border-l-4 border-l-primary/30">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <GripVertical className="h-4 w-4 rotate-180" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
            <Badge variant="outline" className="font-mono">
              Step {stepNumber}
            </Badge>
            <ActionIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onRemove(step.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <Select
            value={step.action_type}
            onValueChange={(v) => { if (v) onActionTypeChange(step.id, v as string); }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an action..." />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((option) => {
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

        {step.action_type && (
          <ActionConfigFields
            actionType={step.action_type}
            config={step.action_config as Record<string, unknown>}
            onChange={(config) => onConfigChange(step.id, config)}
          />
        )}
      </CardContent>
    </Card>
  );
}

export { actionOptions };
