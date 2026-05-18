"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreVertical,
  Trash2,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import type { Form } from "@/types/database";

interface FormCardProps {
  form: Form & {
    form_submissions?: Array<{ count: number }>;
  };
  onClick: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function FormCard({ form, onClick, onDelete, onToggleActive }: FormCardProps) {
  const fields = (form.fields as Array<{ id: string; type: string; label: string }>) || [];
  const submissionCount = form.form_submissions?.[0]?.count ?? 0;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md group"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start gap-2">
          <div className="mt-1 rounded-md bg-primary/10 p-2">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{form.name}</CardTitle>
            {form.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {form.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={form.is_active ? "default" : "secondary"}>
            {form.is_active ? "Active" : "Inactive"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Edit Form
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleActive(); }}>
                {form.is_active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{fields.length} field{fields.length !== 1 ? "s" : ""}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{submissionCount} submission{submissionCount !== 1 ? "s" : ""}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>
            Created {new Date(form.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
