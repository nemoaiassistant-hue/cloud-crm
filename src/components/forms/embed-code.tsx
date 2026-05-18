"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Code } from "lucide-react";

interface EmbedCodeProps {
  formId: string;
}

export function EmbedCode({ formId }: EmbedCodeProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const embedSnippet = `<div id="cloudcrm-form-${formId}"></div>
<script>
  (function() {
    var s = document.createElement('script');
    s.src = '${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/forms/${formId}/embed.js';
    s.async = true;
    s.onload = function() {
      CloudCRMForm.render('${formId}');
    };
    document.head.appendChild(s);
  })();
</script>`;

  const apiEndpoint = `POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/forms/${formId}/submit
Content-Type: application/json

{
  "data": {
    "field_id_1": "value",
    "field_id_2": "value"
  },
  "source": "website",
  "create_contact": true
}`;

  const directUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/forms/${formId}/submit`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Embed Code</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* JavaScript Embed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">JavaScript Embed</h4>
            <Badge variant="outline" className="text-xs">Recommended</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Add this snippet to your website to embed the form.
          </p>
          <div className="relative">
            <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto font-mono">
              {embedSnippet}
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => handleCopy(embedSnippet, "embed")}
            >
              {copied === "embed" ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Direct URL */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Direct Link</h4>
          <p className="text-xs text-muted-foreground">
            Share this link to collect submissions directly.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-mono truncate">
              {directUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => handleCopy(directUrl, "url")}
            >
              {copied === "url" ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* API Endpoint */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">API Endpoint</h4>
          <p className="text-xs text-muted-foreground">
            Use this endpoint to submit form data programmatically.
          </p>
          <div className="relative">
            <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto font-mono">
              {apiEndpoint}
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => handleCopy(apiEndpoint, "api")}
            >
              {copied === "api" ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
