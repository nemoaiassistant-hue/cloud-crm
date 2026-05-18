"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { FormField } from "./field-editor";

interface FormPreviewProps {
  name: string;
  description: string | null;
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
}

export function FormPreview({
  name,
  description,
  fields,
  submitButtonText,
  successMessage,
}: FormPreviewProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Live Preview
          </CardTitle>
          <Badge variant="outline" className="text-xs">Preview</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-background p-4 space-y-4">
          {/* Form Header */}
          <div>
            <h3 className="font-semibold text-lg">{name || "Untitled Form"}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>

          {/* Fields */}
          {fields.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Add fields to see a preview
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label className="text-sm">
                    {field.label || "Unnamed Field"}
                    {field.required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>

                  {field.type === "text" && (
                    <Input
                      placeholder={field.placeholder}
                      disabled
                      className="bg-muted/50"
                    />
                  )}
                  {field.type === "email" && (
                    <Input
                      type="email"
                      placeholder={field.placeholder || "email@example.com"}
                      disabled
                      className="bg-muted/50"
                    />
                  )}
                  {field.type === "phone" && (
                    <Input
                      type="tel"
                      placeholder={field.placeholder || "+1 (555) 000-0000"}
                      disabled
                      className="bg-muted/50"
                    />
                  )}
                  {field.type === "textarea" && (
                    <Textarea
                      placeholder={field.placeholder}
                      disabled
                      className="bg-muted/50 min-h-[80px]"
                    />
                  )}
                  {field.type === "select" && (
                    <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      {field.placeholder || "Select an option..."}
                    </div>
                  )}
                  {field.type === "checkbox" && (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-input bg-muted/50" />
                      <span className="text-sm text-muted-foreground">
                        {field.placeholder || "Check this option"}
                      </span>
                    </div>
                  )}
                  {field.type === "radio" && field.options.length > 0 && (
                    <div className="space-y-2">
                      {field.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border border-input bg-muted/50" />
                          <span className="text-sm text-muted-foreground">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {field.type === "radio" && field.options.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Add options in the editor</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <Button className="w-full" disabled>
            {submitButtonText || "Submit"}
          </Button>

          {/* Success Message Preview */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Success: {successMessage || "Thank you for your submission!"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
