-- ============================================================
-- CCIS — AuraBank | Database Schema
-- ============================================================
-- Run this in Supabase SQL Editor BEFORE rls.sql and seed.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id           UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  phone             TEXT,
  account_number    TEXT,                  -- AuraBank account reference
  churn_risk_score  INT DEFAULT 0 CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
  complaint_count   INT DEFAULT 0
);

-- ============================================================
-- 2. EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.employees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  department  TEXT NOT NULL CHECK (department IN ('IT', 'Finance', 'Operations', 'Cards', 'Loans')),
  role        TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'senior_agent')),
  is_ceo      BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- 3. COMPLAINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_id             UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  category                TEXT NOT NULL CHECK (category IN ('Billing', 'Technical', 'Service', 'Cards', 'Loans', 'KYC', 'Other')),
  subcategory             TEXT,
  description             TEXT NOT NULL,
  product                 TEXT,              -- e.g. "AuraBank Platinum Credit Card", "UPI", "FD Account"
  attachment_urls         TEXT[],
  preferred_resolution    TEXT NOT NULL CHECK (preferred_resolution IN ('Refund', 'Replacement', 'Apology', 'Waiver', 'Other')),
  financial_loss_customer NUMERIC(12,2),
  financial_loss_ai       NUMERIC(12,2),
  status                  TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED')),
  priority                TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  department              TEXT CHECK (department IN ('IT', 'Finance', 'Operations', 'Cards', 'Loans')),
  assigned_to             UUID REFERENCES public.employees(id),
  sla_deadline            TIMESTAMPTZ,
  escalated               BOOLEAN NOT NULL DEFAULT FALSE,
  escalation_reason       TEXT,
  escalated_at            TIMESTAMPTZ,
  resolution_note         TEXT,
  resolved_at             TIMESTAMPTZ,
  feedback_rating         INT CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_text           TEXT,
  source                  TEXT NOT NULL DEFAULT 'web_form' CHECK (source IN ('web_form', 'api'))
);

-- ============================================================
-- 4. MESSAGES (complaint communication log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  complaint_id        UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  sender_id           UUID NOT NULL,       -- customer.id, employee.id, or CEO employee.id
  sender_role         TEXT NOT NULL CHECK (sender_role IN ('customer', 'employee', 'ceo')),
  message_text        TEXT NOT NULL,
  visible_to_customer BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 5. AI ANALYSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  complaint_id          UUID NOT NULL UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
  sentiment             TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  sentiment_score       NUMERIC(4,3) CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
  urgency               TEXT CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
  classification        TEXT,
  summary               TEXT,
  suggested_response    TEXT,
  financial_loss_estimate NUMERIC(12,2),
  embedding             TEXT               -- stored as JSON string; pgvector not required in Phase 1
);

-- ============================================================
-- 6. CLUSTERS (root-cause themes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clusters (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  label            TEXT NOT NULL,
  description      TEXT,
  complaint_ids    UUID[],
  total_complaints INT DEFAULT 0,
  financial_impact NUMERIC(14,2) DEFAULT 0,
  trend_data       JSONB            -- {month: count} for sparkline
);

-- ============================================================
-- 7. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id      UUID NOT NULL,
  actor_role    TEXT NOT NULL CHECK (actor_role IN ('customer', 'employee', 'ceo', 'system')),
  action        TEXT NOT NULL,   -- e.g. 'status_change', 'escalation', 'message_sent'
  resource_type TEXT NOT NULL,   -- e.g. 'complaint', 'api_key'
  resource_id   UUID,
  metadata      JSONB            -- additional context
);

-- ============================================================
-- 8. API KEYS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  key_hash    TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  created_by  UUID REFERENCES public.employees(id),
  last_used   TIMESTAMPTZ,
  usage_count INT DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_id UUID NOT NULL,             -- employee.id or CEO employee.id
  event_type  TEXT NOT NULL,              -- 'escalation', 'assignment', 'sla_warning', 'churn_flag'
  title       TEXT NOT NULL,
  body        TEXT,
  complaint_id UUID REFERENCES public.complaints(id),
  read        BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- 10. FAQs (for customer self-help suggestions in Phase 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faqs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category    TEXT NOT NULL,
  keywords    TEXT[],
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  helpful_count INT DEFAULT 0
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_complaints_customer_id ON public.complaints(customer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON public.complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON public.complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_escalated ON public.complaints(escalated);
CREATE INDEX IF NOT EXISTS idx_messages_complaint_id ON public.messages(complaint_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_complaint_id ON public.ai_analyses(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON public.audit_logs(resource_id);

-- ============================================================
-- AUTO-UPDATE updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_ai_analyses_updated_at
  BEFORE UPDATE ON public.ai_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER set_clusters_updated_at
  BEFORE UPDATE ON public.clusters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
