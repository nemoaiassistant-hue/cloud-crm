"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppointmentType } from "@/types/database";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentTypes: AppointmentType[];
  selectedDate?: Date | null;
  onCreated: () => void;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  appointmentTypes,
  selectedDate,
  onCreated,
}: CreateAppointmentDialogProps) {
  const [title, setTitle] = useState("");
  const [appointmentTypeId, setAppointmentTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [assignedTo, setAssignedTo] = useState("");
  const [contactId, setContactId] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill date when a date is selected on the calendar
  useEffect(() => {
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      setStartDate(`${y}-${m}-${d}`);
    }
  }, [selectedDate]);

  // Auto-set end time based on appointment type duration
  useEffect(() => {
    const selectedType = appointmentTypes.find(
      (t) => t.id === appointmentTypeId
    );
    if (selectedType && startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + selectedType.duration_minutes;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      setEndTime(
        `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(
          2,
          "0"
        )}`
      );
    }
  }, [appointmentTypeId, startTime, appointmentTypes]);

  const resetForm = useCallback(() => {
    setTitle("");
    setAppointmentTypeId("");
    setStartTime("09:00");
    setEndTime("09:30");
    setAssignedTo("");
    setContactId("");
    setLocation("");
    setNotes("");
    setError("");
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    if (!title || !appointmentTypeId || !startDate || !startTime || !endTime) {
      setError("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    try {
      // Combine date + time into ISO strings
      const startIso = new Date(
        `${startDate}T${startTime}:00`
      ).toISOString();
      const endIso = new Date(`${startDate}T${endTime}:00`).toISOString();

      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          appointment_type_id: appointmentTypeId,
          start_time: startIso,
          end_time: endIso,
          assigned_to: assignedTo || undefined,
          contact_id: contactId || null,
          location: location || null,
          notes: notes || null,
          status: "scheduled",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create appointment");
        setSubmitting(false);
        return;
      }

      onOpenChange(false);
      resetForm();
      onCreated();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="apt-title">Title *</Label>
            <Input
              id="apt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Appointment title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-type">Appointment Type *</Label>
            <Select
              value={appointmentTypeId}
              onValueChange={(v) => setAppointmentTypeId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      {type.name} ({type.duration_minutes}min)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="apt-date">Date *</Label>
              <Input
                id="apt-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apt-start">Start *</Label>
              <Input
                id="apt-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apt-end">End *</Label>
              <Input
                id="apt-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="apt-assigned">Assigned To (User ID)</Label>
              <Input
                id="apt-assigned"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="User UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apt-contact">Contact (ID)</Label>
              <Input
                id="apt-contact"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                placeholder="Contact UUID"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-location">Location</Label>
            <Input
              id="apt-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Office, Zoom link..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-notes">Notes</Label>
            <Textarea
              id="apt-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !title || !appointmentTypeId || !startDate}
          >
            {submitting ? "Creating..." : "Create Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
