"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface OpportunityWithContact {
  id: string;
  name: string;
  value: number | null;
  status: string;
  assigned_to: string | null;
  stage_id: string;
  pipeline_id: string;
  contact_id: string;
  contacts: {
    first_name: string;
    last_name: string;
  } | null;
}

interface PipelineCardProps {
  opportunity: OpportunityWithContact;
  index: number;
  onClick: (opportunity: OpportunityWithContact) => void;
  stageColor?: string;
}

export function PipelineCard({ opportunity, index, onClick, stageColor }: PipelineCardProps) {
  const contactName = opportunity.contacts
    ? `${opportunity.contacts.first_name} ${opportunity.contacts.last_name}`
    : "No contact";

  const initials = opportunity.contacts
    ? `${opportunity.contacts.first_name[0]}${opportunity.contacts.last_name[0]}`
    : "?";

  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    closed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <Draggable draggableId={opportunity.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2"
        >
          <div
            className={`bg-card rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-foreground/20 ${
              snapshot.isDragging ? "shadow-xl ring-2 ring-primary/30 rotate-1 scale-105" : ""
            }`}
            onClick={() => onClick(opportunity)}
          >
            {/* Color accent bar */}
            <div
              className="h-1 rounded-t-lg"
              style={{ backgroundColor: stageColor || "#6b7280" }}
            />
            <div className="p-3">
              <div className="flex flex-col gap-2">
                {/* Name + Status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-tight line-clamp-2">
                    {opportunity.name}
                  </span>
                  {opportunity.status && opportunity.status !== "open" && (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 shrink-0 ${
                        statusColors[opportunity.status] || ""
                      }`}
                    >
                      {opportunity.status}
                    </Badge>
                  )}
                </div>

                {/* Contact */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: stageColor || "#6b7280" }}
                  >
                    {initials}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {contactName}
                  </span>
                </div>

                {/* Value + Assigned */}
                <div className="flex items-center justify-between">
                  {opportunity.value ? (
                    <span className="text-xs font-semibold text-foreground/80">
                      {opportunity.value.toLocaleString("sv-SE")} kr
                    </span>
                  ) : (
                    <span />
                  )}
                  {opportunity.assigned_to && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="size-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
