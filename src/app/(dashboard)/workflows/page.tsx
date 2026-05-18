"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WorkflowCard from "@/components/workflows/workflow-card";
import TriggerSelector from "@/components/workflows/trigger-selector";
import type { Workflow, WorkflowStep } from "@/types/database";

interface WorkflowWithSteps extends Workflow {
  workflow_steps: WorkflowStep[];
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowWithSteps[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Create dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTriggerType, setFormTriggerType] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Filter state
  const [filterStatus, setFilterStatus] = useState("");

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("is_active", filterStatus);

      const res = await fetch(`/api/v1/workflows?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setWorkflows(json.data);
        setTotal(json.total ?? json.data.length);
      }
    } catch (err) {
      console.error("Failed to fetch workflows:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormTriggerType("");
    setFormError("");
  };

  const handleCreate = async () => {
    setFormSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/v1/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          trigger_type: formTriggerType,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to create workflow");
        return;
      }

      setDialogOpen(false);
      resetForm();
      fetchWorkflows();
    } catch {
      setFormError("An unexpected error occurred");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/workflows/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (res.ok) {
        fetchWorkflows();
      }
    } catch (err) {
      console.error("Failed to toggle workflow:", err);
    }
  };

  const activeCount = workflows.filter((w) => w.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">
            {total} workflow{total !== 1 ? "s" : ""} · {activeCount} active
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger render={<Button>Create Workflow</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {formError && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="wf-name">Workflow Name *</Label>
                <Input
                  id="wf-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. New Lead Welcome Sequence"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wf-desc">Description</Label>
                <Textarea
                  id="wf-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What does this workflow do?"
                  rows={2}
                />
              </div>
              <TriggerSelector
                value={formTriggerType}
                onChange={setFormTriggerType}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={formSubmitting || !formName || !formTriggerType}
              >
                {formSubmitting ? "Creating..." : "Create Workflow"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select
          value={filterStatus || "__all__"}
          onValueChange={(v) =>
            setFilterStatus(v === "__all__" ? "" : v ?? "")
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Workflows</SelectItem>
            <SelectItem value="true">Active Only</SelectItem>
            <SelectItem value="false">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
        {filterStatus && (
          <Button variant="ghost" size="sm" onClick={() => setFilterStatus("")}>
            Clear filter
          </Button>
        )}
      </div>

      {/* Workflow Cards */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-muted-foreground">
              No workflows yet. Create your first workflow to automate your
              processes!
            </p>
          </div>
        ) : (
          workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
