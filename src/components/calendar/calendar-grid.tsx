"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment, AppointmentType } from "@/types/database";

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

interface CalendarGridProps {
  currentDate: Date;
  appointments: AppointmentWithType[];
  appointmentTypes: AppointmentType[];
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  selectedDate: Date | null;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function CalendarGrid({
  currentDate,
  appointments,
  appointmentTypes,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  selectedDate,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Previous month days to fill the grid
  const prevMonthDays = getDaysInMonth(
    month === 0 ? year - 1 : year,
    month === 0 ? 11 : month - 1
  );

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const map: Record<number, AppointmentWithType[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = [];
    }
    appointments.forEach((apt) => {
      const aptDate = new Date(apt.start_time);
      if (
        aptDate.getFullYear() === year &&
        aptDate.getMonth() === month
      ) {
        const day = aptDate.getDate();
        if (map[day]) {
          map[day].push(apt);
        }
      }
    });
    return map;
  }, [appointments, year, month, daysInMonth]);

  // Build calendar cells
  const cells: {
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    date: Date;
  }[] = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      date: new Date(
        month === 0 ? year - 1 : year,
        month === 0 ? 11 : month - 1,
        day
      ),
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({
      day: d,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      date,
    });
  }

  // Next month padding
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      day: d,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      date: new Date(
        month === 11 ? year + 1 : year,
        month === 11 ? 0 : month + 1,
        d
      ),
    });
  }

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "no-show":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{monthName}</h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <TooltipProvider>
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayAppointments = cell.isCurrentMonth
              ? appointmentsByDay[cell.day] || []
              : [];

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(cell.date)}
                className={cn(
                  "min-h-[100px] border-b border-r p-1.5 cursor-pointer transition-colors hover:bg-accent/50",
                  !cell.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  cell.isSelected && "bg-accent",
                  cell.isToday && !cell.isSelected && "bg-accent/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm",
                      cell.isToday &&
                        "bg-primary text-primary-foreground font-bold"
                    )}
                  >
                    {cell.day}
                  </span>
                  {dayAppointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {dayAppointments.length}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 space-y-0.5">
                  {dayAppointments.slice(0, 3).map((apt) => {
                    const typeColor =
                      apt.appointment_types?.color || "#6B7280";
                    return (
                      <Tooltip key={apt.id}>
                        <TooltipTrigger className="block">
                          <div
                            className="truncate rounded px-1.5 py-0.5 text-xs font-medium text-white cursor-default"
                            style={{ backgroundColor: typeColor }}
                          >
                            {formatTime(apt.start_time)} {apt.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">{apt.title}</p>
                            <p className="text-xs">
                              {formatTime(apt.start_time)} –{" "}
                              {formatTime(apt.end_time)}
                            </p>
                            <Badge
                              variant="secondary"
                              className={getStatusColor(apt.status)}
                            >
                              {apt.status}
                            </Badge>
                            {apt.contacts && (
                              <p className="text-xs">
                                {apt.contacts.first_name}{" "}
                                {apt.contacts.last_name}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {dayAppointments.length > 3 && (
                    <p className="text-xs text-muted-foreground pl-1">
                      +{dayAppointments.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
