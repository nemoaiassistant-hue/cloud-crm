"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
  Zap,
  Loader2,
} from "lucide-react";
import TriggerSelector from "@/components/workflows/trigger-selector";
import ActionStep from "@/components/workflows/action-step";
import type { Workflow, WorkflowStep } from "@/types/database";

interface WorkflowDetail extends Workflow {
  workflow_steps: WorkflowStep[];
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  // Track locally modified steps for saving
  const [modifiedSteps, setModifiedSteps] = useState<Set<string>>(new Set());
  const [deletedSteps, setDeletedSteps] = useState<Set<string>>(new Set());

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchWorkflow = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/workflows/${workflowId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        const data = json.data as WorkflowDetail;
        setWorkflow(data);
        setName(data.name);
        setDescription(data.description || "");
        setTriggerType(data.trigger_type);
        const sorted = [...(data.workflow_steps || [])].sort(
          (a, b) => a.step_order - b.step_order
        );
        setSteps(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch workflow:", err);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const handleToggleActive = async () => {
    if (!workflow) return;
    try {
      const res = await fetch(`/api/v1/workflows/${workflowId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !workflow.is_active }),
      });
      if (res.ok) {
        const json = await res.json();
        setWorkflow((prev) => (prev ? { ...prev, is_active: json.data.is_active } : null));
      }
    } catch (err) {
      console.error("Failed to toggle:", err);
    }
  };

  const handleAddStep = async () => {
    try {
      const res = await fetch(`/api/v1/workflows/${workflowId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: "send_email",
          action_config: {},
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSteps((prev) => [...prev, json.data as WorkflowStep]);
      }
    } catch (err) {
      console.error("Failed to add step:", err);
    }
  };

  const handleActionTypeChange = async (stepId: string, actionType: string) => {
    // Optimistically update local state
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, action_type: actionType, action_config: {} } : s
      )
    );

    // Persist action type change
    try {
      await fetch(`/api/v1/workflows/${workflowId}/steps/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: actionType, action_config: {} }),
      });
    } catch {
      // silent — will be caught on save
    }
  };

  const handleConfigChange = (stepId: string, config: Record<string, unknown>) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, action_config: config } : s
      )
    );
    setModifiedSteps((prev) => new Set(prev).add(stepId));
  };

  const handleRemoveStep = async (stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    // Delete from DB
    try {
      await fetch(`/api/v1/workflows/${workflowId}/steps/${stepId}`, {
        method: "DELETE",
      });
    } catch {
      // silent
    }
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      // 1. Update workflow metadata
      const wfRes = await fetch(`/api/v1/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          trigger_type: triggerType,
        }),
      });

      if (!wfRes.ok) {
        const json = await wfRes.json();
        setSaveError(json.error || "Failed to save workflow");
        return;
      }

      // 2. Save modified step configs
      const configUpdates = Array.from(modifiedSteps).map((stepId) => {
        const step = steps.find((s) => s.id === stepId);
        if (!step) return Promise.resolve();
        return fetch(`/api/v1/workflows/${workflowId}/steps/${stepId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action_config: step.action_config }),
        });
      });
      await Promise.all(configUpdates);

      // 3. Reorder steps
      if (steps.length > 0) {
        const reorderRes = await fetch(`/api/v1/workflows/${workflowId}/steps`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step_ids: steps.map((s) => s.id),
          }),
        });

        if (!reorderRes.ok) {
          const json = await reorderRes.json();
          setSaveError(json.error || "Failed to reorder steps");
          return;
        }
      }

      // Update local state
      setModifiedSteps(new Set());
      setDeletedSteps(new Set());
      fetchWorkflow();
    } catch {
      setSaveError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/v1/workflows/${workflowId}`, { method: "DELETE" });
      router.push("/workflows");
    } catch (err) {
      console.error("Failed to delete workflow:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading workflow...</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Workflow not found.</p>
        <Button variant="outline" onClick={() => router.push("/workflows")}>
          Back to Workflows
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/workflows")}>
        ← Back to Workflows
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">
                  <Zap className="h-5 w-5 inline mr-2 text-primary" />
                  Workflow Builder
                </CardTitle>
                <Badge variant={workflow.is_active ? "default" : "secondary"}>
                  {workflow.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleToggleActive}>
                {workflow.is_active ? "Pause Workflow" : "Activate Workflow"}
              </Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wf-name">Workflow Name</Label>
              <Input
                id="wf-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workflow name"
              />
            </div>
            <TriggerSelector
              value={triggerType}
              onChange={setTriggerType}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wf-desc">Description</Label>
            <Textarea
              id="wf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this workflow do?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save bar */}
      {saveError && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {saveError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Steps ({steps.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={handleAddStep}>
            <Plus className="h-4 w-4 mr-1" />
            Add Step
          </Button>
        </div>
      </div>

      <Separator />

      {/* Steps */}
      <div className="space-y-4">
        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg gap-4">
            <p className="text-muted-foreground">
              No steps yet. Add your first action step to get started.
            </p>
            <Button onClick={handleAddStep}>
              <Plus className="h-4 w-4 mr-1" />
              Add First Step
            </Button>
          </div>
        ) : (
          steps.map((step, index) => (
            <div key={step.id} className="flex gap-2">
              <div className="flex flex-col justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={index === 0}
                  onClick={() => handleMoveStep(index, "up")}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={index === steps.length - 1}
                  onClick={() => handleMoveStep(index, "down")}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <ActionStep
                  step={step}
                  stepNumber={index + 1}
                  onActionTypeChange={handleActionTypeChange}
                  onConfigChange={handleConfigChange}
                  onRemove={handleRemoveStep}
                  isFirst={index === 0}
                  isLast={index === steps.length - 1}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{workflow.name}&quot;? This
            action cannot be undone and will remove all associated steps.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
