"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Eye } from "lucide-react";
import type { FormSubmission, Form } from "@/types/database";

export default function FormSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const fetchForm = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/forms/${formId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setForm(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch form:", err);
    }
  }, [formId]);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/forms/${formId}/submissions?limit=100`);
      const json = await res.json();
      if (json.data) {
        setSubmissions(json.data);
        setTotal(json.total ?? json.data.length);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchForm();
    fetchSubmissions();
  }, [fetchForm, fetchSubmissions]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fields = (form?.fields as Array<{ id: string; label: string; type: string }>) || [];

  // Get unique column labels from fields (show first 3-4 in table)
  const tableFields = fields.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/forms/${formId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Form
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            {form?.name || "Form"} — Submissions
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} submission{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No submissions yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Submissions will appear here when people fill out your form.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date</TableHead>
                  {tableFields.map((field) => (
                    <TableHead key={field.id}>{field.label}</TableHead>
                  ))}
                  <TableHead>Source</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-[60px]">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => {
                  const contact = sub.contacts as any;
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(sub.created_at)}
                      </TableCell>
                      {tableFields.map((field) => (
                        <TableCell key={field.id} className="max-w-[200px] truncate">
                          {String(sub.data?.[field.id] ?? "—")}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {sub.source || "embed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contact ? (
                          <button
                            className="text-primary hover:underline text-sm"
                            onClick={() => router.push(`/contacts/${contact.id}`)}
                          >
                            {contact.first_name} {contact.last_name}
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => { if (!open) setSelectedSubmission(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{formatDate(selectedSubmission.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedSubmission.source || "embed"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-medium">{selectedSubmission.ip_address || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  {selectedSubmission.contacts ? (
                    <button
                      className="text-primary hover:underline font-medium"
                      onClick={() => {
                        setSelectedSubmission(null);
                        router.push(`/contacts/${selectedSubmission.contacts.id}`);
                      }}
                    >
                      {selectedSubmission.contacts.first_name} {selectedSubmission.contacts.last_name}
                    </button>
                  ) : (
                    <span className="text-muted-foreground">Not linked</span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Form Data</h4>
                <div className="space-y-2">
                  {fields.map((field) => {
                    const value = selectedSubmission.data?.[field.id];
                    return (
                      <div key={field.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{field.label}</span>
                        <span className="font-medium text-right max-w-[60%] break-all">
                          {value !== undefined && value !== null ? String(value) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
