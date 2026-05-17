-- CloudCRM Seed Data — Airway Clinic Demo
-- Run after 001_initial_schema.sql

-- ==========================================
-- Tenant: Airway Clinic
-- ==========================================
INSERT INTO tenants (id, name, slug, settings) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Airway Clinic', 'airway-clinic', '{"timezone": "Europe/Stockholm", "currency": "SEK", "language": "sv"}');

-- ==========================================
-- Users (passwords set via Supabase Auth)
-- ==========================================
-- Demo user: Nima (admin)
INSERT INTO users (id, tenant_id, email, name, role) VALUES
  ('a1b2c3d4-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'nima@airwayclinic.se', 'Nima Hakimmaani', 'admin');

-- Demo user: Jessica (staff)
INSERT INTO users (id, tenant_id, email, name, role) VALUES
  ('a1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'jessica@airwayclinic.se', 'Jessica Gorlee', 'staff');

-- ==========================================
-- Contacts (Airway Clinic leads from GHL)
-- ==========================================
INSERT INTO contacts (id, tenant_id, first_name, last_name, email, phone, tags, source, status) VALUES
  ('c1-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Lisen', 'Asp', 'lisen.asp@email.se', '+46701234501', ARRAY['sleep-apnea','cpap-intolerant','narrow-palate'], 'website', 'active'),
  ('c1-0002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Jerzy', 'Michajlowski', 'jerzy.m@email.se', '+46701234502', ARRAY['tmj','pediatric','orthodontics'], 'referral', 'active'),
  ('c1-0003', 'a1b2c3d4-0001-4000-8000-000000000001', 'Cecilia', 'Hall', 'cecilia.hall@email.se', '+46701234503', ARRAY['mouth-breathing','narrow-palate','pediatric-concern'], 'google', 'active'),
  ('c1-0004', 'a1b2c3d4-0001-4000-8000-000000000001', 'Anders', 'Svensson', 'anders.s@email.se', '+46701234504', ARRAY['snoring','sleep-apnea'], 'facebook', 'contacted'),
  ('c1-0005', 'a1b2c3d4-0001-4000-8000-000000000001', 'Maria', 'Lindqvist', 'maria.l@email.se', '+46701234505', ARRAY['myofunctional','tongue-tie'], 'website', 'active'),
  ('c1-0006', 'a1b2c3d4-0001-4000-8000-000000000001', 'Erik', 'Johansson', 'erik.j@email.se', '+46701234506', ARRAY['bruxism','tmj','sleep-apnea'], 'google', 'consulted'),
  ('c1-0007', 'a1b2c3d4-0001-4000-8000-000000000001', 'Sara', 'Bergström', 'sara.b@email.se', '+46701234507', ARRAY['sleep-apnea','cpap-alternative'], 'referral', 'active'),
  ('c1-0008', 'a1b2c3d4-0001-4000-8000-000000000001', 'Thomas', 'Nyström', 'thomas.n@email.se', '+46701234508', ARRAY['snoring','partner-complaint'], 'instagram', 'new'),
  ('c1-0009', 'a1b2c3d4-0001-4000-8000-000000000001', 'Katarina', 'Olsson', 'katarina.o@email.se', '+46701234509', ARRAY['pediatric','mouth-breathing','adenoids'], 'website', 'active'),
  ('c1-0010', 'a1b2c3d4-0001-4000-8000-000000000001', 'Pär', 'Gustafsson', 'par.g@email.se', '+46701234510', ARRAY['sleep-apnea','overweight'], 'facebook', 'lost');

-- ==========================================
-- Pipelines
-- ==========================================
INSERT INTO pipelines (id, tenant_id, name, sort_order) VALUES
  ('p1-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'New Leads', 1),
  ('p1-0002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Myofunctional', 2);

-- Pipeline Stages: New Leads
INSERT INTO pipeline_stages (id, pipeline_id, name, sort_order, color) VALUES
  ('s1-0001', 'p1-0001', 'New Lead', 1, '#94a3b8'),
  ('s1-0002', 'p1-0001', 'Contacted', 2, '#60a5fa'),
  ('s1-0003', 'p1-0001', 'Consultation Booked', 3, '#a78bfa'),
  ('s1-0004', 'p1-0001', 'Consultation Done', 4, '#818cf8'),
  ('s1-0005', 'p1-0001', 'Treatment Proposed', 5, '#c084fc'),
  ('s1-0006', 'p1-0001', 'Treatment Accepted', 6, '#f472b6'),
  ('s1-0007', 'p1-0001', 'In Treatment', 7, '#34d399'),
  ('s1-0008', 'p1-0001', 'Follow-up', 8, '#fbbf24'),
  ('s1-0009', 'p1-0001', 'Completed', 9, '#22c55e'),
  ('s1-0010', 'p1-0001', 'Lost', 10, '#f87171');

-- Pipeline Stages: Myofunctional
INSERT INTO pipeline_stages (id, pipeline_id, name, sort_order, color) VALUES
  ('s2-0001', 'p1-0002', 'Assessment', 1, '#94a3b8'),
  ('s2-0002', 'p1-0002', 'Active Therapy', 2, '#60a5fa'),
  ('s2-0003', 'p1-0002', 'Review', 3, '#fbbf24'),
  ('s2-0004', 'p1-0002', 'Completed', 4, '#22c55e');

-- ==========================================
-- Opportunities
-- ==========================================
INSERT INTO opportunities (id, tenant_id, contact_id, pipeline_id, stage_id, name, value, status, assigned_to) VALUES
  ('o1-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0001', 'p1-0001', 's1-0004', 'Lisen Asp — Sleep Apnea Treatment', 45000.00, 'open', 'a1b2c3d4-0002-4000-8000-000000000001'),
  ('o1-0002', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0002', 'p1-0001', 's1-0003', 'Jerzy Michajlowski — TMJ (Daughter)', 35000.00, 'open', 'a1b2c3d4-0002-4000-8000-000000000002'),
  ('o1-0003', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0003', 'p1-0001', 's1-0002', 'Cecilia Hall — Mouth Breathing', 40000.00, 'open', NULL),
  ('o1-0004', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0004', 'p1-0001', 's1-0002', 'Anders Svensson — Snoring', 25000.00, 'open', 'a1b2c3d4-0002-4000-8000-000000000001'),
  ('o1-0005', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0005', 'p1-0002', 's2-0002', 'Maria Lindqvist — Myofunctional Therapy', 30000.00, 'open', 'a1b2c3d4-0002-4000-8000-000000000002'),
  ('o1-0006', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0006', 'p1-0001', 's1-0007', 'Erik Johansson — Bruxism + TMJ', 55000.00, 'open', 'a1b2c3d4-0002-4000-8000-000000000001'),
  ('o1-0007', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0007', 'p1-0001', 's1-0001', 'Sara Bergström — Sleep Apnea', 40000.00, 'open', NULL),
  ('o1-0008', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0009', 'p1-0002', 's2-0001', 'Katarina Olsson — Pediatric', 25000.00, 'open', 'a1b2c3d4-0002-4000-8000-000000000002'),
  ('o1-0009', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0010', 'p1-0001', 's1-0010', 'Pär Gustafsson — Lost', 0, 'lost', NULL);

-- ==========================================
-- Tasks
-- ==========================================
INSERT INTO tasks (id, tenant_id, contact_id, title, description, status, priority, assigned_to, due_date) VALUES
  ('t1-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0001', 'Write treatment plan — Lisen Asp', 'Create 5-phase treatment plan: Assessment → Myofunctional → ALF → CPAP optimisation → Monitoring', 'in_progress', 'high', 'a1b2c3d4-0002-4000-8000-000000000001', '2026-05-20T10:00:00Z'),
  ('t1-0002', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0002', 'Follow up — Jerzy''s daughter TMJ', 'Call Jerzy to confirm consultation date for 16yo daughter', 'todo', 'high', 'a1b2c3d4-0002-4000-8000-000000000002', '2026-05-19T09:00:00Z'),
  ('t1-0003', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0003', 'Send info pack — Cecilia Hall', 'Email info about mouth breathing effects on children, include self-assessment form', 'todo', 'medium', NULL, '2026-05-21T12:00:00Z'),
  ('t1-0004', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0005', 'Schedule Jessica intake — Maria', 'Book myofunctional assessment with Jessica', 'todo', 'medium', 'a1b2c3d4-0002-4000-8000-000000000002', '2026-05-22T14:00:00Z'),
  ('t1-0005', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0007', 'Contact Sara — Sleep Apnea', 'Follow up on referral, discuss CPAP alternatives', 'todo', 'low', NULL, '2026-05-23T10:00:00Z'),
  ('t1-0006', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0006', 'Review Erik progress', '4-week treatment review — check bruxism improvement', 'done', 'medium', 'a1b2c3d4-0002-4000-8000-000000000001', '2026-05-16T11:00:00Z');

-- ==========================================
-- Conversations & Messages
-- ==========================================
INSERT INTO conversations (id, tenant_id, contact_id, channel, status) VALUES
  ('conv-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0001', 'email', 'open'),
  ('conv-0002', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0002', 'email', 'open'),
  ('conv-0003', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0003', 'email', 'open'),
  ('conv-0004', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0008', 'email', 'open'),
  ('conv-0005', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1-0007', 'email', 'open');

-- Messages for Lisen Asp conversation
INSERT INTO messages (id, conversation_id, tenant_id, direction, channel, content, sent_at) VALUES
  ('msg-0001', 'conv-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'inbound', 'email', 'Hej, jag har haft sömnapné i flera år och tål inte CPAP-maskinen. Jag har hört att ni kan hjälpa med alternativ. Kan jag boka en konsultation?', '2026-05-15T08:30:00Z'),
  ('msg-0002', 'conv-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'outbound', 'email', 'Hej Lisen! Vad roligt att du kontaktar oss. Vi kan absolut hjälpa till med alternativ till CPAP. Jag skulle gärna boka en konsultation med dig. Finns det en tid som passar bäst?', '2026-05-15T10:15:00Z'),
  ('msg-0003', 'conv-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'inbound', 'email', 'Tack för snabbt svar! Det skulle passa bra på tisdag eller onsdag förmiddag.', '2026-05-15T14:22:00Z'),
  ('msg-0004', 'conv-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'outbound', 'email', 'Perfekt! Jag har bokat dig för onsdag 18 maj kl 10:00. Vi kommer göra en genomgång av din sömnapné, undersöka gommen och diskutera behandlingsalternativ. Välkommen!', '2026-05-15T15:00:00Z');

-- Messages for Jerzy conversation
INSERT INTO messages (id, conversation_id, tenant_id, direction, channel, content, sent_at) VALUES
  ('msg-0005', 'conv-0002', 'a1b2c3d4-0001-4000-8000-000000000001', 'inbound', 'email', 'Hej, min 16-åriga dotter har haft käkproblem sedan hon tog av sin tandställning. Hon har smärta och klickande i käken. Kan ni hjälpa?', '2026-05-14T16:45:00Z'),
  ('msg-0006', 'conv-0002', 'a1b2c3d4-0001-4000-8000-000000000001', 'outbound', 'email', 'Hej Jerzy! Ja, vi har stor erfarenhet av TMJ-problem hos unga efter ortodonti. Det låter som att din dotter kan ha en käkledsdysfunktion. Jag rekommenderar en konsultation där vi kan utvärdera henne. Skicka gärna remiss från er tandläkare om ni har en.', '2026-05-14T17:30:00Z');

-- Messages for Cecilia conversation
INSERT INTO messages (id, conversation_id, tenant_id, direction, channel, content, sent_at) VALUES
  ('msg-0007', 'conv-0003', 'a1b2c3d4-0001-4000-8000-000000000001', 'inbound', 'email', 'Hej, jag är 34 år och har andats genom munnen hela livet. Min 1-åriga son verkar också andas genom munnen. Jag är orolig. Vad kan vi göra?', '2026-05-16T09:10:00Z'),
  ('msg-0008', 'conv-0003', 'a1b2c3d4-0001-4000-8000-000000000001', 'outbound', 'email', 'Hej Cecilia! Det är bra att du är uppmärksam på detta. Munandning kan påverka både tänder, käke och sömn. Vi kan göra en bedömning av både dig och din son. Jag skickar mer information via email.', '2026-05-16T11:00:00Z');

-- Messages for Thomas (new inquiry)
INSERT INTO messages (id, conversation_id, tenant_id, direction, channel, content, sent_at) VALUES
  ('msg-0009', 'conv-0004', 'a1b2c3d4-0001-4000-8000-000000000001', 'inbound', 'email', 'Min partner klagar på att jag snarkar jättemycket. Jag har sett er på Instagram. Vad kostar en undersökning?', '2026-05-17T20:30:00Z');

-- ==========================================
-- Activity Log
-- ==========================================
INSERT INTO activity_log (id, tenant_id, user_id, contact_id, action, details, created_at) VALUES
  ('act-0001', 'a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000001', 'c1-0001', 'contact.created', '{"source": "website"}', '2026-05-15T08:25:00Z'),
  ('act-0002', 'a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000001', 'c1-0001', 'opportunity.moved', '{"from": "New Lead", "to": "Contacted"}', '2026-05-15T10:15:00Z'),
  ('act-0003', 'a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', 'c1-0002', 'contact.created', '{"source": "referral"}', '2026-05-14T16:40:00Z'),
  ('act-0004', 'a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000001', 'c1-0003', 'contact.created', '{"source": "google"}', '2026-05-16T09:05:00Z'),
  ('act-0005', 'a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000001', 'c1-0001', 'opportunity.moved', '{"from": "Contacted", "to": "Consultation Booked"}', '2026-05-15T15:00:00Z'),
  ('act-0006', 'a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000001', 'c1-0001', 'opportunity.moved', '{"from": "Consultation Booked", "to": "Consultation Done"}', '2026-05-18T10:30:00Z'),
  ('act-0007', 'a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000001', 'c1-0006', 'task.completed', '{"task": "Review Erik progress"}', '2026-05-16T11:00:00Z'),
  ('act-0008', 'a1b2c3d4-0001-4000-8000-000000000001', NULL, 'c1-0008', 'contact.created', '{"source": "instagram"}', '2026-05-17T20:25:00Z');
