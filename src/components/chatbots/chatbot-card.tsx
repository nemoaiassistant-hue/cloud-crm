"use client";

import { Bot, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChatbotConfig } from "@/types/database";

interface ChatbotCardProps {
  chatbot: ChatbotConfig;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

export function ChatbotCard({ chatbot, onClick, onDelete }: ChatbotCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: chatbot.primary_color + "20" }}
          >
            <Bot
              className="size-5"
              style={{ color: chatbot.primary_color }}
            />
          </div>
          <div>
            <CardTitle className="text-base">{chatbot.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {chatbot.position === "bottom-right"
                ? "Bottom Right"
                : chatbot.position === "bottom-left"
                  ? "Bottom Left"
                  : chatbot.position}
            </p>
          </div>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chatbot.id);
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {chatbot.welcome_message}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="size-5 rounded-full border"
            style={{ backgroundColor: chatbot.primary_color }}
            title={`Color: ${chatbot.primary_color}`}
          />
          {chatbot.collect_email && (
            <Badge variant="outline" className="text-xs">
              Email
            </Badge>
          )}
          {chatbot.collect_name && (
            <Badge variant="outline" className="text-xs">
              Name
            </Badge>
          )}
        </div>
        {chatbot.quick_replies && chatbot.quick_replies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {chatbot.quick_replies.slice(0, 3).map((reply, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {reply}
              </Badge>
            ))}
            {chatbot.quick_replies.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{chatbot.quick_replies.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
