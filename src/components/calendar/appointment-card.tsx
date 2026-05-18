"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Clock, MapPin, User } from "lucide-react";
import type { Appointment } from "@/types/database";

interface AppointmentWithType extends Appointment {
  appointment_types?: {
    id: string;
    name: string;
    color: string;
    duration_minutes: number;
  } | null;
  contacts?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
  } | null;
  users?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface AppointmentCardProps {
  appointment: AppointmentWithType;
  onStatusChange?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (appointment: AppointmentWithType) => void;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getStatusStyle(status: string) {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "confirmed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "completed":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "no-show":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

const STATUS_OPTIONS = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no-show",
];

export function AppointmentCard({
  appointment,
  onStatusChange,
  onDelete,
  onClick,
}: AppointmentCardProps) {
  const typeColor = appointment.appointment_types?.color || "#6B7280";
  const typeName = appointment.appointment_types?.name || "Unknown Type";

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(appointment)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div
              className="mt-1 h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: typeColor }}
            />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {appointment.title}
              </p>
              <p className="text-xs text-muted-foreground">{typeName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant="secondary"
              className={`text-xs ${getStatusStyle(appointment.status)}`}
            >
              {appointment.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange?.(appointment.id, status);
                    }}
                    disabled={appointment.status === status}
                  >
                    Mark as {status}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(appointment.id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>
              {formatDate(appointment.start_time)},{" "}
              {formatTime(appointment.start_time)} –{" "}
              {formatTime(appointment.end_time)}
            </span>
          </div>
          {appointment.users && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span>{appointment.users.name}</span>
            </div>
          )}
          {appointment.contacts && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span>
                {appointment.contacts.first_name}{" "}
                {appointment.contacts.last_name}
              </span>
            </div>
          )}
          {appointment.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{appointment.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
