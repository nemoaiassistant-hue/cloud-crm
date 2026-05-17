"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Contact, Task } from "@/types/database";

// Mock activity entries
const mockActivities = [
  { id: "1", action: "Contact created", details: "Added via web form", created_at: "2026-05-17T10:30:00Z" },
  { id: "2", action: "Email sent", details: "Welcome email sent to contact", created_at: "2026-05-17T11:00:00Z" },
  { id: "3", action: "Note added", details: "Follow-up call scheduled for next week", created_at: "2026-05-17T14:00:00Z" },
  { id: "4", action: "Status changed", details: "Changed from Lead to Prospect", created_at: "2026-05-18T09:00:00Z" },
];

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchContact = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/contacts/${contactId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setContact(json.data);
        setEditFirstName(json.data.first_name || "");
        setEditLastName(json.data.last_name || "");
        setEditEmail(json.data.email || "");
        setEditPhone(json.data.phone || "");
        setEditSource(json.data.source || "");
        setEditStatus(json.data.status || "");
        setEditTags((json.data.tags || []).join(", "));
      }
    } catch (err) {
      console.error("Failed to fetch contact:", err);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/tasks?contact_id=${contactId}`);
      const json = await res.json();
      if (json.data) {
        setTasks(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, [contactId]);

  useEffect(() => {
    fetchContact();
    fetchTasks();
  }, [fetchContact, fetchTasks]);

  const handleUpdate = async () => {
    setEditSubmitting(true);
    setEditError("");
    try {
      const tags = editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/v1/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail || null,
          phone: editPhone || null,
          source: editSource || null,
          status: editStatus,
          tags,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setEditError(json.error || "Failed to update contact");
        return;
      }

      setContact(json.data);
      setEditOpen(false);
    } catch {
      setEditError("An unexpected error occurred");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/v1/contacts/${contactId}`, { method: "DELETE" });
      router.push("/contacts");
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading contact...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Contact not found.</p>
        <Button variant="outline" onClick={() => router.push("/contacts")}>
          Back to Contacts
        </Button>
      </div>
    );
  }

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "todo":
        return "secondary" as const;
      case "in_progress":
        return "default" as const;
      case "done":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/contacts")}>
        ← Back to Contacts
      </Button>

      {/* Contact Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {contact.first_name} {contact.last_name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{contact.status}</Badge>
              {contact.source && (
                <span className="capitalize">via {contact.source}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{contact.email || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{contact.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(contact.created_at)}</p>
            </div>
          </div>
          {contact.tags && contact.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">First Name</p>
                  <p className="font-medium">{contact.first_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Name</p>
                  <p className="font-medium">{contact.last_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{contact.email || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{contact.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{contact.source || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline">{contact.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(contact.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(contact.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tasks linked to this contact.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(task.status)}>
                            {task.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {task.due_date ? formatDate(task.due_date) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {editError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={editSource || undefined} onValueChange={(v) => setEditSource(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus || undefined} onValueChange={(v) => setEditStatus(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={editTags} onChange={(e) => setEditTags(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={editSubmitting || !editFirstName || !editLastName}>
              {editSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {contact.first_name} {contact.last_name}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
