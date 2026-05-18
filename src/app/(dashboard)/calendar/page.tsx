"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { AppointmentCard } from "@/components/calendar/appointment-card";
import { CreateAppointmentDialog } from "@/components/calendar/create-appointment-dialog";
import { AppointmentTypeManager } from "@/components/calendar/appointment-type-manager";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<AppointmentWithType[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [sidebarMiniMonth, setSidebarMiniMonth] = useState(new Date());

  // Compute date range for the current month view
  const dateRange = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOfWeek = new Date(firstDay);
    startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());

    const lastDay = new Date(year, month + 1, 0);
    const endOfWeek = new Date(lastDay);
    endOfWeek.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    return {
      start: startOfWeek.toISOString(),
      end: endOfWeek.toISOString(),
    };
  }, [currentDate]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("start_date", dateRange.start);
      params.set("end_date", dateRange.end);
      if (filterStatus) params.set("status", filterStatus);
      params.set("limit", "200");

      const res = await fetch(`/api/v1/appointments?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setAppointments(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, filterStatus]);

  const fetchAppointmentTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/appointments/types");
      const json = await res.json();
      if (json.data) {
        setAppointmentTypes(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch appointment types:", err);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointmentTypes();
  }, [fetchAppointmentTypes]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/v1/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await fetch(`/api/v1/appointments/${id}`, { method: "DELETE" });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to delete appointment:", err);
    }
  };

  // Filter appointments for the selected date
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return appointments
      .filter((apt) => isSameDay(new Date(apt.start_time), selectedDate))
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
  }, [appointments, selectedDate]);

  // Stats
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      "no-show": 0,
    };
    appointments.forEach((apt) => {
      if (counts[apt.status] !== undefined) {
        counts[apt.status]++;
      }
    });
    return counts;
  }, [appointments]);

  // Mini calendar helpers
  const miniMonthName = sidebarMiniMonth.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });

  const miniDaysInMonth = new Date(
    sidebarMiniMonth.getFullYear(),
    sidebarMiniMonth.getMonth() + 1,
    0
  ).getDate();

  const miniFirstDay = new Date(
    sidebarMiniMonth.getFullYear(),
    sidebarMiniMonth.getMonth(),
    1
  ).getDay();

  const miniPrevMonth = () =>
    setSidebarMiniMonth(
      new Date(
        sidebarMiniMonth.getFullYear(),
        sidebarMiniMonth.getMonth() - 1,
        1
      )
    );
  const miniNextMonth = () =>
    setSidebarMiniMonth(
      new Date(
        sidebarMiniMonth.getFullYear(),
        sidebarMiniMonth.getMonth() + 1,
        1
      )
    );

  // Build mini calendar cells
  const miniCells: { day: number; date: Date }[] = [];
  const prevMonthDays = new Date(
    sidebarMiniMonth.getFullYear(),
    sidebarMiniMonth.getMonth(),
    0
  ).getDate();
  for (let i = miniFirstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    miniCells.push({
      day,
      date: new Date(
        sidebarMiniMonth.getFullYear(),
        sidebarMiniMonth.getMonth() - 1,
        day
      ),
    });
  }
  for (let d = 1; d <= miniDaysInMonth; d++) {
    miniCells.push({
      day: d,
      date: new Date(
        sidebarMiniMonth.getFullYear(),
        sidebarMiniMonth.getMonth(),
        d
      ),
    });
  }
  const remaining = 42 - miniCells.length;
  for (let d = 1; d <= remaining; d++) {
    miniCells.push({
      day: d,
      date: new Date(
        sidebarMiniMonth.getFullYear(),
        sidebarMiniMonth.getMonth() + 1,
        d
      ),
    });
  }

  // Check if a day has appointments
  const dayHasAppointments = (date: Date) => {
    return appointments.some((apt) =>
      isSameDay(new Date(apt.start_time), date)
    );
  };

  const today = new Date();

  const selectedDateStr = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            {appointments.length} appointment
            {appointments.length !== 1 ? "s" : ""} this month
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          {/* Status filter */}
          <div className="flex items-center gap-2 mb-4">
            <Select
              value={filterStatus || "__all__"}
              onValueChange={(v) =>
                setFilterStatus(v === "__all__" ? "" : (v ?? ""))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
            {filterStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterStatus("")}
              >
                Clear
              </Button>
            )}
          </div>

          <CalendarGrid
            currentDate={currentDate}
            appointments={appointments}
            appointmentTypes={appointmentTypes}
            onSelectDate={handleSelectDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            selectedDate={selectedDate}
          />

          {/* Selected day appointments */}
          {selectedDate && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{selectedDateStr}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {selectedDateAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No appointments on this day
                </p>
              ) : (
                <div className="grid gap-2">
                  {selectedDateAppointments.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{miniMonthName}</CardTitle>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={miniPrevMonth}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={miniNextMonth}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-7 gap-0 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div
                    key={i}
                    className="text-xs font-medium text-muted-foreground py-1"
                  >
                    {d}
                  </div>
                ))}
                {miniCells.map((cell, idx) => {
                  const isToday = isSameDay(cell.date, today);
                  const isSelected =
                    selectedDate && isSameDay(cell.date, selectedDate);
                  const hasAppts = dayHasAppointments(cell.date);
                  const isCurrentMonth =
                    cell.date.getMonth() === sidebarMiniMonth.getMonth();

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(cell.date);
                        setCurrentDate(
                          new Date(
                            cell.date.getFullYear(),
                            cell.date.getMonth(),
                            1
                          )
                        );
                      }}
                      className={`relative h-7 w-7 text-xs rounded-md flex items-center justify-center mx-auto transition-colors
                        ${
                          !isCurrentMonth
                            ? "text-muted-foreground/40"
                            : "hover:bg-accent"
                        }
                        ${isToday ? "bg-primary text-primary-foreground font-bold" : ""}
                        ${isSelected && !isToday ? "bg-accent font-medium" : ""}
                      `}
                    >
                      {cell.day}
                      {hasAppts && !isSelected && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                {[
                  {
                    label: "Scheduled",
                    key: "scheduled",
                    color:
                      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                  },
                  {
                    label: "Confirmed",
                    key: "confirmed",
                    color:
                      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                  },
                  {
                    label: "Completed",
                    key: "completed",
                    color:
                      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                  },
                  {
                    label: "Cancelled",
                    key: "cancelled",
                    color:
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                  },
                  {
                    label: "No Show",
                    key: "no-show",
                    color:
                      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
                  },
                ].map(({ label, key, color }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between"
                  >
                    <Badge variant="secondary" className={`text-xs ${color}`}>
                      {label}
                    </Badge>
                    <span className="text-sm font-medium">
                      {statusCounts[key]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Type Manager */}
          <Card>
            <CardContent className="pt-4">
              <AppointmentTypeManager
                appointmentTypes={appointmentTypes}
                onRefresh={fetchAppointmentTypes}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Appointment Dialog */}
      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        appointmentTypes={appointmentTypes}
        selectedDate={selectedDate}
        onCreated={fetchAppointments}
      />
    </div>
  );
}
