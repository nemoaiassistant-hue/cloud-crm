"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { GripVertical, Trash2, Plus, X } from "lucide-react";

export interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio";
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

interface FieldEditorProps {
  field: FormField;
  index: number;
  onUpdate: (index: number, field: FormField) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
];

export function FieldEditor({
  field,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: FieldEditorProps) {
  const hasOptions = field.type === "select" || field.type === "radio";

  const handleAddOption = () => {
    onUpdate(index, {
      ...field,
      options: [...field.options, `Option ${field.options.length + 1}`],
    });
  };

  const handleUpdateOption = (optIndex: number, value: string) => {
    const newOptions = [...field.options];
    newOptions[optIndex] = value;
    onUpdate(index, { ...field, options: newOptions });
  };

  const handleRemoveOption = (optIndex: number) => {
    const newOptions = field.options.filter((_, i) => i !== optIndex);
    onUpdate(index, { ...field, options: newOptions });
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={isFirst}
              onClick={() => onMoveUp(index)}
            >
              <GripVertical className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={isLast}
              onClick={() => onMoveDown(index)}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-[1fr_140px_40px] gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(index, { ...field, label: e.target.value })}
                placeholder="Field label"
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select
                value={field.type}
                onValueChange={(v) =>
                  onUpdate(index, { ...field, type: v as FormField["type"] })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pl-10 grid grid-cols-[1fr_80px] gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Placeholder</Label>
            <Input
              value={field.placeholder}
              onChange={(e) => onUpdate(index, { ...field, placeholder: e.target.value })}
              placeholder="Placeholder text"
              className="h-8"
            />
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate(index, { ...field, required: e.target.checked })}
                className="rounded border-gray-300"
              />
              Required
            </label>
          </div>
        </div>

        {hasOptions && (
          <div className="pl-10 space-y-2">
            <Label className="text-xs text-muted-foreground">Options</Label>
            {field.options.map((opt, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => handleUpdateOption(optIndex, e.target.value)}
                  className="h-7 text-sm"
                  placeholder={`Option ${optIndex + 1}`}
                />
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveOption(optIndex)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleAddOption}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
