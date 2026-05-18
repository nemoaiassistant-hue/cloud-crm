"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { PipelineColumn } from "@/components/pipelines/pipeline-column";
import { CreateOpportunityDialog } from "@/components/pipelines/create-opportunity-dialog";
import { CreatePipelineDialog } from "@/components/pipelines/create-pipeline-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LayoutGrid } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  pipeline_id: string;
}

interface PipelineWithStages {
  id: string;
  name: string;
  tenant_id: string;
  sort_order: number;
  pipeline_stages: PipelineStage[];
}

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

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<PipelineWithStages[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [opportunities, setOpportunities] = useState<OpportunityWithContact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createPipelineOpen, setCreatePipelineOpen] = useState(false);
  const [createOppOpen, setCreateOppOpen] = useState(false);
  const [addOppStageId, setAddOppStageId] = useState("");

  // Edit sheet state
  const [editOpp, setEditOpp] = useState<OpportunityWithContact | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const stages = selectedPipeline?.pipeline_stages || [];

  const fetchPipelines = useCallback(async () => {
    const res = await fetch("/api/v1/pipelines");
    if (res.ok) {
      const json = await res.json();
      setPipelines(json.data);
      if (json.data.length > 0 && !selectedPipelineId) {
        setSelectedPipelineId(json.data[0].id);
      }
    }
  }, [selectedPipelineId]);

  const fetchOpportunities = useCallback(async () => {
    if (!selectedPipelineId) return;
    const res = await fetch(
      `/api/v1/opportunities?pipeline_id=${selectedPipelineId}`
    );
    if (res.ok) {
      const json = await res.json();
      setOpportunities(json.data);
    }
  }, [selectedPipelineId]);

  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/v1/contacts?limit=100");
    if (res.ok) {
      const json = await res.json();
      setContacts(json.data);
    }
  }, []);

  useEffect(() => {
    fetchPipelines();
    fetchContacts();
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [selectedPipelineId]);

  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines, selectedPipelineId]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === result.source.droppableId) return;

    const opp = opportunities.find((o) => o.id === draggableId);
    if (!opp) return;

    // Optimistic update
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === draggableId ? { ...o, stage_id: destination.droppableId } : o
      )
    );

    try {
      const res = await fetch(`/api/v1/opportunities/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage_id: destination.droppableId }),
      });

      if (!res.ok) {
        // Revert on failure
        fetchOpportunities();
      }
    } catch {
      fetchOpportunities();
    }
  };

  const handleAddOpportunity = (stage: PipelineStage) => {
    setAddOppStageId(stage.id);
    setCreateOppOpen(true);
  };

  const handleEditOpportunity = (opp: OpportunityWithContact) => {
    setEditOpp(opp);
    setEditName(opp.name);
    setEditValue(opp.value?.toString() || "");
    setEditStatus(opp.status);
  };

  const handleSaveEdit = async () => {
    if (!editOpp) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/v1/opportunities/${editOpp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          value: editValue ? parseFloat(editValue) : null,
          status: editStatus,
        }),
      });

      if (res.ok) {
        fetchOpportunities();
        setEditOpp(null);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteOpportunity = async () => {
    if (!editOpp) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/v1/opportunities/${editOpp.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchOpportunities();
        setEditOpp(null);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const getOpportunitiesForStage = (stageId: string) =>
    opportunities.filter((o) => o.stage_id === stageId);

  if (loading && pipelines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <span className="text-muted-foreground">Loading pipelines...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Pipelines</h1>
          {pipelines.length > 0 && (
            <Select value={selectedPipelineId} onValueChange={(v) => { if (v) setSelectedPipelineId(v); }}>
              <SelectTrigger className="w-52 ml-2">
                {selectedPipeline ? selectedPipeline.name : "Select pipeline"}
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedPipeline && opportunities.length > 0 && (
            <div className="hidden sm:flex items-center gap-3 ml-3 text-sm text-muted-foreground">
              <span>{opportunities.length} opportunities</span>
              <span>•</span>
              <span className="font-medium text-foreground">
                {opportunities.reduce((s, o) => s + (o.value || 0), 0).toLocaleString("sv-SE")} kr total
              </span>
            </div>
          )}
        </div>
        <Button onClick={() => setCreatePipelineOpen(true)} size="sm">
          <Plus className="size-4" />
          Add Pipeline
        </Button>
      </div>

      {/* Kanban Board */}
      {selectedPipeline ? (
        <ScrollArea className="flex-1">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 p-4 min-h-0">
              {stages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  opportunities={getOpportunitiesForStage(stage.id)}
                  onAddOpportunity={handleAddOpportunity}
                  onOpportunityClick={handleEditOpportunity}
                />
              ))}
              {stages.length === 0 && (
                <div className="flex items-center justify-center w-full min-h-[300px] text-muted-foreground">
                  No stages in this pipeline. Add stages via the pipeline settings.
                </div>
              )}
            </div>
          </DragDropContext>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
          <LayoutGrid className="size-12" />
          <p>No pipelines yet. Create your first pipeline to get started.</p>
          <Button onClick={() => setCreatePipelineOpen(true)}>
            <Plus className="size-4" />
            Create Pipeline
          </Button>
        </div>
      )}

      {/* Create Pipeline Dialog */}
      <CreatePipelineDialog
        open={createPipelineOpen}
        onOpenChange={setCreatePipelineOpen}
        onSuccess={() => fetchPipelines()}
      />

      {/* Create Opportunity Dialog */}
      {selectedPipelineId && (
        <CreateOpportunityDialog
          open={createOppOpen}
          onOpenChange={setCreateOppOpen}
          pipelineId={selectedPipelineId}
          stageId={addOppStageId}
          stages={stages}
          contacts={contacts}
          onSuccess={fetchOpportunities}
        />
      )}

      {/* Edit Opportunity Sheet */}
      <Sheet open={!!editOpp} onOpenChange={(open) => !open && setEditOpp(null)}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Opportunity</SheetTitle>
            <SheetDescription>Update opportunity details.</SheetDescription>
          </SheetHeader>
          {editOpp && (
            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Value (kr)</Label>
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="e.g. 45000"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => { if (v) setEditStatus(v); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editOpp.contacts && (
                <div className="flex flex-col gap-1.5">
                  <Label>Contact</Label>
                  <Input
                    disabled
                    value={`${editOpp.contacts.first_name} ${editOpp.contacts.last_name}`}
                  />
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveEdit} disabled={editLoading} className="flex-1">
                  {editLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteOpportunity}
                  disabled={editLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
