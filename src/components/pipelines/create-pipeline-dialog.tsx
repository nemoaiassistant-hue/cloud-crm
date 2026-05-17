"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface CreatePipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface StageInput {
  name: string;
  color: string;
}

const DEFAULT_STAGES: StageInput[] = [
  { name: "Lead", color: "#94a3b8" },
  { name: "Qualified", color: "#60a5fa" },
  { name: "Proposal", color: "#f59e0b" },
  { name: "Negotiation", color: "#a78bfa" },
  { name: "Won", color: "#34d399" },
  { name: "Lost", color: "#f87171" },
];

const COLOR_OPTIONS = [
  "#94a3b8",
  "#60a5fa",
  "#f59e0b",
  "#a78bfa",
  "#34d399",
  "#f87171",
  "#fb923c",
  "#2dd4bf",
];

export function CreatePipelineDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePipelineDialogProps) {
  const [name, setName] = useState("");
  const [stages, setStages] = useState<StageInput[]>([...DEFAULT_STAGES]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addStage = () => {
    setStages([...stages, { name: "", color: "#94a3b8" }]);
  };

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, field: keyof StageInput, value: string) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validStages = stages.filter((s) => s.name.trim());
    if (!name.trim()) {
      setError("Pipeline name is required");
      return;
    }
    if (validStages.length === 0) {
      setError("At least one stage is required");
      return;
    }

    setLoading(true);
    try {
      // Create pipeline
      const pipelineRes = await fetch("/api/v1/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!pipelineRes.ok) {
        const data = await pipelineRes.json();
        throw new Error(data.error || "Failed to create pipeline");
      }

      const pipelineData = await pipelineRes.json();
      const pipelineId = pipelineData.data.id;

      // Create stages
      for (let i = 0; i < validStages.length; i++) {
        const stageRes = await fetch(`/api/v1/pipelines/${pipelineId}/stages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validStages[i].name,
            color: validStages[i].color,
            sort_order: i,
          }),
        });

        if (!stageRes.ok) {
          const data = await stageRes.json();
          throw new Error(data.error || "Failed to create stage");
        }
      }

      setName("");
      setStages([...DEFAULT_STAGES]);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Pipeline</DialogTitle>
          <DialogDescription>Create a new pipeline with custom stages.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pipeline-name">Pipeline Name</Label>
            <Input
              id="pipeline-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Pipeline"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Stages</Label>
              <Button type="button" variant="ghost" size="xs" onClick={addStage}>
                <Plus className="size-3" />
                Add Stage
              </Button>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {stages.map((stage, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-4 h-4 rounded-full transition-transform ${
                          stage.color === color ? "scale-125 ring-2 ring-foreground/30" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateStage(i, "color", color)}
                      />
                    ))}
                  </div>
                  <Input
                    value={stage.name}
                    onChange={(e) => updateStage(i, "name", e.target.value)}
                    placeholder={`Stage ${i + 1}`}
                    className="flex-1 h-7 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeStage(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={loading || !name}>
              {loading ? "Creating..." : "Create Pipeline"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
