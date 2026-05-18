"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Workflow,
} from "lucide-react";
import type { Workflow as WorkflowType, WorkflowStep } from "@/types/database";

interface WorkflowWithSteps extends WorkflowType {
  workflow_steps: WorkflowStep[];
}

const triggerLabels: Record<string, string> = {
  contact_created: "Contact Created",
  contact_tag_added: "Tag Added to Contact",
  opportunity_stage_changed: "Opportunity Stage Changed",
  opportunity_created: "Opportunity Created",
  task_completed: "Task Completed",
  task_due_soon: "Task Due Soon",
  form_submitted: "Form Submitted",
  chat_message_received: "Chat Message Received",
  chat_session_created: "Chat Session Created",
};

const triggerIcons: Record<string, React.ReactNode> = {
  contact_created: <UserPlus className="h-4 w-4" />,
  contact_tag_added: <Tag className="h-4 w-4" />,
  opportunity_stage_changed: <ArrowRightLeft className="h-4 w-4" />,
  opportunity_created: <Briefcase className="h-4 w-4" />,
  task_completed: <CheckSquare className="h-4 w-4" />,
  task_due_soon: <Clock className="h-4 w-4" />,
  form_submitted: <FileText className="h-4 w-4" />,
  chat_message_received: <MessageSquare className="h-4 w-4" />,
  chat_session_created: <MessageCircle className="h-4 w-4" />,
};

interface WorkflowCardProps {
  workflow: WorkflowWithSteps;
  onToggle: (id: string, isActive: boolean) => void;
}

export default function WorkflowCard({ workflow, onToggle }: WorkflowCardProps) {
  const router = useRouter();
  const stepCount = workflow.workflow_steps?.length ?? 0;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/workflows/${workflow.id}`)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {workflow.name}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {triggerIcons[workflow.trigger_type] || <Workflow className="h-4 w-4" />}
            <span>{triggerLabels[workflow.trigger_type] || workflow.trigger_type}</span>
          </div>
        </div>
        <Badge variant={workflow.is_active ? "default" : "secondary"}>
          {workflow.is_active ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{stepCount} step{stepCount !== 1 ? "s" : ""}</span>
          {workflow.description && (
            <>
              <span>·</span>
              <span className="truncate max-w-[200px]">{workflow.description}</span>
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(workflow.id, !workflow.is_active);
          }}
        >
          {workflow.is_active ? "Pause" : "Activate"}
        </Button>
      </CardContent>
    </Card>
  );
}

export { triggerLabels, triggerIcons };
