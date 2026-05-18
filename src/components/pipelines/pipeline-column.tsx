"use client";

import { Droppable } from "@hello-pangea/dnd";
import { PipelineCard } from "./pipeline-card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  pipeline_id: string;
}

interface PipelineColumnProps {
  stage: PipelineStage;
  opportunities: OpportunityWithContact[];
  onAddOpportunity: (stage: PipelineStage) => void;
  onOpportunityClick: (opportunity: OpportunityWithContact) => void;
}

export function PipelineColumn({
  stage,
  opportunities,
  onAddOpportunity,
  onOpportunityClick,
}: PipelineColumnProps) {
  const totalValue = opportunities.reduce(
    (sum, opp) => sum + (opp.value || 0),
    0
  );

  return (
    <div className="flex flex-col w-72 min-w-[288px] shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl bg-muted/50 border border-b-0">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-background"
            style={{ backgroundColor: stage.color || "#6b7280" }}
          />
          <span className="text-sm font-semibold">{stage.name}</span>
          <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {opportunities.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {totalValue > 0 && (
            <span className="text-xs font-medium text-muted-foreground mr-1">
              {totalValue.toLocaleString("sv-SE")} kr
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onAddOpportunity(stage)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 rounded-b-xl border border-t-0 min-h-[120px] overflow-y-auto transition-colors ${
              snapshot.isDraggingOver
                ? "bg-primary/5 border-primary/20"
                : "bg-muted/20"
            }`}
          >
            {opportunities.map((opp, index) => (
              <PipelineCard
                key={opp.id}
                opportunity={opp}
                index={index}
                onClick={onOpportunityClick}
                stageColor={stage.color}
              />
            ))}
            {provided.placeholder}
            {opportunities.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/60">
                Drop opportunities here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
