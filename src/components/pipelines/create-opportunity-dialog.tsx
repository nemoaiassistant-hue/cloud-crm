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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PipelineStage {
  id: string;
  name: string;
  pipeline_id: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  stageId: string;
  stages: PipelineStage[];
  contacts: Contact[];
  onSuccess: () => void;
}

export function CreateOpportunityDialog({
  open,
  onOpenChange,
  pipelineId,
  stageId,
  stages,
  contacts,
  onSuccess,
}: CreateOpportunityDialogProps) {
  const [name, setName] = useState("");
  const [contactId, setContactId] = useState("");
  const [value, setValue] = useState("");
  const [selectedStageId, setSelectedStageId] = useState(stageId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact_id: contactId,
          pipeline_id: pipelineId,
          stage_id: selectedStageId,
          value: value ? parseFloat(value) : null,
          status: "open",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create opportunity");
      }

      setName("");
      setContactId("");
      setValue("");
      setSelectedStageId(stageId);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Opportunity</DialogTitle>
          <DialogDescription>Add a new opportunity to this pipeline stage.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="opp-name">Name</Label>
            <Input
              id="opp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Deal name"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Contact</Label>
            <Select value={contactId} onValueChange={(v) => v && setContactId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Stage</Label>
            <Select value={selectedStageId} onValueChange={(v) => v && setSelectedStageId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="opp-value">Value ($)</Label>
            <Input
              id="opp-value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={loading || !name || !contactId}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
