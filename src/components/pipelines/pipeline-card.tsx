"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, DollarSign } from "lucide-react";

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
}

export function PipelineCard({ opportunity, index, onClick }: PipelineCardProps) {
  const contactName = opportunity.contacts
    ? `${opportunity.contacts.first_name} ${opportunity.contacts.last_name}`
    : "No contact";

  return (
    <Draggable draggableId={opportunity.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2"
        >
          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
            }`}
            onClick={() => onClick(opportunity)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium leading-tight">
                  {opportunity.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {contactName}
                </span>
                <div className="flex items-center justify-between mt-1">
                  {opportunity.value ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="size-3" />
                      <span>${opportunity.value.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span />
                  )}
                  {opportunity.status && opportunity.status !== "open" && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {opportunity.status}
                    </Badge>
                  )}
                </div>
                {opportunity.assigned_to && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="size-3" />
                    <span>Assigned</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
