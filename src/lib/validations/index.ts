import { z } from "zod";

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").nullable().optional(),
  phone: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().nullable().optional(),
  status: z.string().optional(),
  custom_fields: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const pipelineSchema = z.object({
  name: z.string().min(1, "Pipeline name is required"),
  sort_order: z.number().optional(),
});

export const pipelineStageSchema = z.object({
  name: z.string().min(1, "Stage name is required"),
  color: z.string().optional(),
  sort_order: z.number().optional(),
});

export const opportunitySchema = z.object({
  contact_id: z.string().min(1, "Contact is required"),
  pipeline_id: z.string().min(1, "Pipeline is required"),
  stage_id: z.string().min(1, "Stage is required"),
  name: z.string().min(1, "Opportunity name is required"),
  value: z.number().nullable().optional(),
  status: z.string().optional(),
  assigned_to: z.string().nullable().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  status: z.union([z.literal("todo"), z.literal("in_progress"), z.literal("done")]).optional(),
  priority: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]).optional(),
  assigned_to: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
});

export const messageSchema = z.object({
  conversation_id: z.string().min(1, "Conversation is required"),
  content: z.string().min(1, "Message content is required"),
  direction: z.union([z.literal("inbound"), z.literal("outbound")]),
  channel: z.string().optional(),
});

export const tenantSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type PipelineInput = z.infer<typeof pipelineSchema>;
export type PipelineStageInput = z.infer<typeof pipelineStageSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export const formSchema = z.object({
  name: z.string().min(1, "Form name is required"),
  description: z.string().nullable().optional(),
  fields: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["text", "email", "phone", "textarea", "select", "checkbox", "radio"]),
      label: z.string().min(1, "Label is required"),
      placeholder: z.string().optional().default(""),
      required: z.boolean().optional().default(false),
      options: z.array(z.string()).optional().default([]),
    })
  ).optional().default([]),
  submit_button_text: z.string().optional().default("Submit"),
  success_message: z.string().optional().default("Thank you for your submission!"),
  redirect_url: z.string().url("Invalid URL").nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const formSubmissionSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  source: z.string().nullable().optional(),
  create_contact: z.boolean().optional().default(false),
});

export type FormInput = z.infer<typeof formSchema>;
export type FormSubmissionInput = z.infer<typeof formSubmissionSchema>;
export type TenantInput = z.infer<typeof tenantSchema>;
