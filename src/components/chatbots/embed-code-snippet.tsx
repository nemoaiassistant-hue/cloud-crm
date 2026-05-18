"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EmbedCodeSnippetProps {
  chatbotId: string;
}

export function EmbedCodeSnippet({ chatbotId }: EmbedCodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script
  src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js"
  data-chatbot-id="${chatbotId}"
  async>
</script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Embed Code</p>
      <p className="text-xs text-muted-foreground">
        Add this snippet to your website to enable the chat widget.
      </p>
      <div className="relative rounded-lg bg-muted p-4">
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono">
          {embedCode}
        </pre>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
