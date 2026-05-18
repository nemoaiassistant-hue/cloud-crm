"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FieldEditor, type FormField } from "@/components/forms/field-editor";
import { FormPreview } from "@/components/forms/form-preview";
import { EmbedCode } from "@/components/forms/embed-code";
import { ArrowLeft, Plus, Save, Loader2 } from "lucide-react";
import type { Form } from "@/types/database";

function generateId() {
  return `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Editable state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [submitButtonText, setSubmitButtonText] = useState("Submit");
  const [successMessage, setSuccessMessage] = useState("Thank you for your submission!");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchForm = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/forms/${formId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        const data = json.data as Form;
        setForm(data);
        setName(data.name);
        setDescription(data.description || "");
        setSubmitButtonText(data.submit_button_text || "Submit");
        setSuccessMessage(data.success_message || "Thank you for your submission!");
        setRedirectUrl(data.redirect_url || "");
        setIsActive(data.is_active);
        setFields(
          (data.fields as FormField[]) || []
        );
      }
    } catch (err) {
      console.error("Failed to fetch form:", err);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/v1/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          fields,
          submit_button_text: submitButtonText,
          success_message: successMessage,
          redirect_url: redirectUrl || null,
          is_active: isActive,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error || "Failed to save form");
        return;
      }

      setForm(json.data);
    } catch {
      setSaveError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/v1/forms/${formId}`, { method: "DELETE" });
      router.push("/forms");
    } catch (err) {
      console.error("Failed to delete form:", err);
    }
  };

  // Field operations
  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: generateId(),
        type: "text",
        label: `Field ${prev.length + 1}`,
        placeholder: "",
        required: false,
        options: [],
      },
    ]);
  };

  const handleUpdateField = (index: number, updatedField: FormField) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = updatedField;
      return copy;
    });
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFields((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= fields.length - 1) return;
    setFields((prev) => {
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Form not found.</p>
        <Button variant="outline" onClick={() => router.push("/forms")}>
          Back to Forms
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Forms
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-xl font-bold">{name || "Untitled Form"}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                {isActive ? "Active" : "Inactive"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {fields.length} field{fields.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveError && (
            <span className="text-sm text-destructive">{saveError}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-destructive"
          >
            Delete
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="builder">Form Builder</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Editor panel */}
            <div className="lg:col-span-3 space-y-4">
              {/* Basic info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Form Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Form Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Form name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Fields */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Fields</CardTitle>
                    <Button size="sm" onClick={handleAddField}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Field
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fields.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No fields yet. Click &quot;Add Field&quot; to get started.
                    </div>
                  ) : (
                    fields.map((field, index) => (
                      <FieldEditor
                        key={field.id}
                        field={field}
                        index={index}
                        onUpdate={handleUpdateField}
                        onRemove={handleRemoveField}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        isFirst={index === 0}
                        isLast={index === fields.length - 1}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview panel */}
            <div className="lg:col-span-2">
              <FormPreview
                name={name}
                description={description || null}
                fields={fields}
                submitButtonText={submitButtonText}
                successMessage={successMessage}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="max-w-2xl space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Submission Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Submit Button Text</Label>
                  <Input
                    value={submitButtonText}
                    onChange={(e) => setSubmitButtonText(e.target.value)}
                    placeholder="Submit"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Success Message</Label>
                  <Textarea
                    value={successMessage}
                    onChange={(e) => setSuccessMessage(e.target.value)}
                    placeholder="Thank you for your submission!"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Redirect URL (optional)</Label>
                  <Input
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://example.com/thank-you"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to show the success message instead.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Form Status</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {isActive ? "Active — accepting submissions" : "Inactive — not accepting submissions"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inactive forms will return an error when submitted.
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="embed" className="mt-4">
          <div className="max-w-2xl">
            <EmbedCode formId={formId} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{name}&quot;? All submissions will be permanently deleted. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
