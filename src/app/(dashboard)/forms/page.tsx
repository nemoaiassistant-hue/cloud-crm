"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { FormCard } from "@/components/forms/form-card";
import type { Form } from "@/types/database";

export default function FormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Create form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/forms?limit=50");
      const json = await res.json();
      if (json.data) {
        setForms(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch forms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormError("");
  };

  const handleCreate = async () => {
    setFormSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to create form");
        return;
      }

      setDialogOpen(false);
      resetForm();
      router.push(`/forms/${json.data.id}`);
    } catch {
      setFormError("An unexpected error occurred");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/forms/${id}`, { method: "DELETE" });
      setDeleteId(null);
      fetchForms();
    } catch (err) {
      console.error("Failed to delete form:", err);
    }
  };

  const handleToggleActive = async (form: Form) => {
    try {
      await fetch(`/api/v1/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !form.is_active }),
      });
      fetchForms();
    } catch (err) {
      console.error("Failed to toggle form:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            {forms.length} form{forms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger
            render={<Button> Create Form </Button>}
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {formError && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="formName">Form Name *</Label>
                <Input
                  id="formName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Contact Us, Lead Capture"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formDescription">Description</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this form..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={formSubmitting || !formName}>
                {formSubmitting ? "Creating..." : "Create Form"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading forms...</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="rounded-full bg-muted p-6">
            <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No forms yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm text-center">
            Create your first form to start capturing leads from your website.
          </p>
          <Button onClick={() => setDialogOpen(true)}>Create Your First Form</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form: any) => (
            <FormCard
              key={form.id}
              form={form}
              onClick={() => router.push(`/forms/${form.id}`)}
              onDelete={() => setDeleteId(form.id)}
              onToggleActive={() => handleToggleActive(form)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this form? All submissions will also be permanently deleted. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
