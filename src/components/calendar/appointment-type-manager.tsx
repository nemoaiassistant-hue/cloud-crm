"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { AppointmentType } from "@/types/database";

interface AppointmentTypeManagerProps {
  appointmentTypes: AppointmentType[];
  onRefresh: () => void;
}

const PRESET_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#6366F1",
  "#14B8A6",
];

export function AppointmentTypeManager({
  appointmentTypes,
  onRefresh,
}: AppointmentTypeManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [bufferMinutes, setBufferMinutes] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setDuration("30");
    setColor(PRESET_COLORS[0]);
    setBufferMinutes("0");
    setEditingId(null);
    setError("");
  }, []);

  const openEdit = (type: AppointmentType) => {
    setEditingId(type.id);
    setName(type.name);
    setDescription(type.description || "");
    setDuration(String(type.duration_minutes));
    setColor(type.color);
    setBufferMinutes(String(type.buffer_minutes));
    setDialogOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    if (!name) {
      setError("Name is required");
      setSubmitting(false);
      return;
    }

    try {
      const url = editingId
        ? `/api/v1/appointments/types/${editingId}`
        : "/api/v1/appointments/types";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          duration_minutes: parseInt(duration, 10),
          color,
          buffer_minutes: parseInt(bufferMinutes, 10),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to save");
        setSubmitting(false);
        return;
      }

      setDialogOpen(false);
      resetForm();
      onRefresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment type?")) return;
    try {
      await fetch(`/api/v1/appointments/types/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (err) {
      console.error("Failed to delete type:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Appointment Types</h3>
        <Button variant="ghost" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      <Separator />
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {appointmentTypes.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No appointment types yet
          </p>
        ) : (
          appointmentTypes.map((type) => (
            <Card key={type.id} className="py-0">
              <CardContent className="p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: type.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {type.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {type.duration_minutes}min
                        {type.buffer_minutes > 0 &&
                          ` + ${type.buffer_minutes}min buffer`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {!type.is_active && (
                      <Badge variant="secondary" className="text-xs mr-1">
                        Inactive
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(type)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(type.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Appointment Type" : "Create Appointment Type"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="type-name">Name *</Label>
              <Input
                id="type-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Discovery Call, Demo, Consultation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-desc">Description</Label>
              <Input
                id="type-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="type-duration">Duration (min)</Label>
                <Select value={duration} onValueChange={(v) => setDuration(v ?? "30")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                    <SelectItem value="120">120 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type-buffer">Buffer (min)</Label>
                <Select value={bufferMinutes} onValueChange={(v) => setBufferMinutes(v ?? "0")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-8 w-8 rounded-md border-2 transition-colors ${
                      color === c
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
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
              onClick={handleSubmit}
              disabled={submitting || !name}
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Create Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
