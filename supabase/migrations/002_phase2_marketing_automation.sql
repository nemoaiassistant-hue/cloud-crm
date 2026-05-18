-- CloudCRM Phase 2: Marketing & Automation
-- Chatbot, Workflows, Forms, Calendar/Booking

-- ============================================================
-- CHATBOT SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  welcome_message TEXT NOT NULL DEFAULT 'Hi! How can we help you today?',
  placeholder TEXT NOT NULL DEFAULT 'Type your message...',
  primary_color TEXT NOT NULL DEFAULT '#2563eb',
  position TEXT NOT NULL DEFAULT 'bottom-right' CHECK (position IN ('bottom-left', 'bottom-right')),
  avatar_url TEXT,
  quick_replies TEXT[] DEFAULT '{}',
  collect_email BOOLEAN NOT NULL DEFAULT true,
  collect_name BOOLEAN NOT NULL DEFAULT true,
  offline_message TEXT DEFAULT 'Sorry, we are currently offline. Please leave your message and we will get back to you.',
  business_hours JSONB DEFAULT '{"enabled": false, "timezone": "Europe/Stockholm", "hours": {"1": {"open": "09:00", "close": "17:00"}, "2": {"open": "09:00", "close": "17:00"}, "3": {"open": "09:00", "close": "17:00"}, "4": {"open": "09:00", "close": "17:00"}, "5": {"open": "09:00", "close": "17:00"}, "6": null, "0": null}}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES chatbot_configs(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_ip TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'unread')),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'agent', 'bot')),
  sender_id UUID,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- WORKFLOWS ENGINE
-- ============================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'contact_created',
    'contact_tag_added',
    'opportunity_stage_changed',
    'opportunity_created',
    'task_completed',
    'task_due_soon',
    'form_submitted',
    'chat_message_received',
    'chat_session_created'
  )),
  trigger_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 0,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'send_email',
    'create_task',
    'add_tag',
    'remove_tag',
    'update_contact',
    'move_opportunity',
    'send_sms',
    'notify_user',
    'wait',
    'webhook'
  )),
  action_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  trigger_entity_id UUID,
  trigger_entity_type TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  current_step INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- FORMS (Lead Capture)
-- ============================================================

CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  submit_button_text TEXT NOT NULL DEFAULT 'Submit',
  success_message TEXT NOT NULL DEFAULT 'Thank you! We will be in touch.',
  redirect_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  style_config JSONB DEFAULT '{"layout": "centered", "primaryColor": "#2563eb", "showLogo": true}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  data JSONB NOT NULL,
  source TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CALENDAR / BOOKING
-- ============================================================

CREATE TABLE IF NOT EXISTS appointment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  color TEXT NOT NULL DEFAULT '#2563eb',
  is_active BOOLEAN NOT NULL DEFAULT true,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  max_per_day INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Stockholm',
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_type_id UUID NOT NULL REFERENCES appointment_types(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_chatbot_configs_tenant ON chatbot_configs(tenant_id);
CREATE INDEX idx_chat_sessions_tenant ON chat_sessions(tenant_id);
CREATE INDEX idx_chat_sessions_chatbot ON chat_sessions(chatbot_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX idx_workflows_active ON workflows(is_active);
CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_forms_tenant ON forms(tenant_id);
CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_tenant ON form_submissions(tenant_id);
CREATE INDEX idx_appointment_types_tenant ON appointment_types(tenant_id);
CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_assigned ON appointments(assigned_to);
CREATE INDEX idx_appointments_start ON appointments(start_time);
CREATE INDEX idx_availability_rules_user ON availability_rules(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Chatbot
CREATE POLICY "tenant_chatbot_configs" ON chatbot_configs FOR ALL USING (tenant_id = get_tenant_id());
CREATE POLICY "tenant_chat_sessions" ON chat_sessions FOR ALL USING (tenant_id = get_tenant_id());
CREATE POLICY "tenant_chat_messages" ON chat_messages FOR ALL USING (tenant_id = get_tenant_id());

-- Workflows
CREATE POLICY "tenant_workflows" ON workflows FOR ALL USING (tenant_id = get_tenant_id());
CREATE POLICY "tenant_workflow_steps" ON workflow_steps FOR ALL USING (workflow_id IN (SELECT id FROM workflows WHERE tenant_id = get_tenant_id()));
CREATE POLICY "tenant_workflow_executions" ON workflow_executions FOR ALL USING (tenant_id = get_tenant_id());

-- Forms (public read for active forms - allows embedding)
CREATE POLICY "tenant_forms" ON forms FOR ALL USING (tenant_id = get_tenant_id());
CREATE POLICY "public_form_submit" ON form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "tenant_form_submissions" ON form_submissions FOR SELECT USING (tenant_id = get_tenant_id());

-- Calendar
CREATE POLICY "tenant_appointment_types" ON appointment_types FOR ALL USING (tenant_id = get_tenant_id());
CREATE POLICY "tenant_availability_rules" ON availability_rules FOR ALL USING (tenant_id = get_tenant_id());
CREATE POLICY "tenant_appointments" ON appointments FOR ALL USING (tenant_id = get_tenant_id());

-- Public access for chat widget (anon key can insert sessions + messages)
CREATE POLICY "public_chat_session_create" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_chat_session_read" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "public_chat_message_create" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public_chat_message_read" ON chat_messages FOR SELECT USING (session_id IN (SELECT id FROM chat_sessions));
