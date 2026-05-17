"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/types/database";

interface TaskWithContact extends Task {
  contacts?: { id: string; first_name: string; last_name: string } | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithContact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formDueDate, setFormDueDate] = useState("");
  const [formContactId, setFormContactId] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterPriority) params.set("priority", filterPriority);
      params.set("limit", "50");

      const res = await fetch(`/api/v1/tasks?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setTasks(json.data);
        setTotal(json.total ?? json.data.length);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormDueDate("");
    setFormContactId("");
    setFormError("");
  };

  const handleCreate = async () => {
    setFormSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          priority: formPriority,
          due_date: formDueDate || null,
          contact_id: formContactId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to create task");
        return;
      }

      setDialogOpen(false);
      resetForm();
      fetchTasks();
    } catch {
      setFormError("An unexpected error occurred");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/v1/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await fetch(`/api/v1/tasks/${taskId}`, { method: "DELETE" });
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusBadge = (status: string) => {
    const variant =
      status === "done"
        ? "default"
        : status === "in_progress"
        ? "default"
        : "secondary";

    const className =
      status === "done"
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        : status === "in_progress"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

    return (
      <Badge variant={variant} className={className}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const priorityBadge = (priority: string) => {
    const className =
      priority === "high"
        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        : priority === "medium"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

    return (
      <Badge variant="secondary" className={className}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {total} total task{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger render={<Button>+ Add Task</Button>} />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {formError && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Task description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formPriority} onValueChange={(v) => setFormPriority(v ?? "medium")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactId">Linked Contact ID (optional)</Label>
                <Input
                  id="contactId"
                  value={formContactId}
                  onChange={(e) => setFormContactId(e.target.value)}
                  placeholder="Contact UUID"
                />
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
                onClick={handleCreate}
                disabled={formSubmitting || !formTitle}
              >
                {formSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filterStatus || "__all__"}
          onValueChange={(v) => setFilterStatus(v === "__all__" ? "" : (v ?? ""))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterPriority || "__all__"}
          onValueChange={(v) => setFilterPriority(v === "__all__" ? "" : (v ?? ""))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        {(filterStatus || filterPriority) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterStatus("");
              setFilterPriority("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No tasks found. Create your first task!
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(v) => handleStatusChange(task.id, v ?? task.status)}
                    >
                      <SelectTrigger size="sm" className="w-32">
                        {statusBadge(task.status)}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{priorityBadge(task.priority)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.assigned_to || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.due_date ? formatDate(task.due_date) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.contacts
                      ? `${task.contacts.first_name} ${task.contacts.last_name}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
