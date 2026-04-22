-- ============================================================
-- CCIS — AuraBank | Row-Level Security Policies
-- ============================================================
-- Run AFTER schema.sql and AFTER creating auth users via seed.sql
-- ============================================================
-- Role detection strategy:
--   auth.jwt() ->> 'user_metadata' contains {"role": "customer|employee|ceo"}
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs              ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: get calling user's role from JWT metadata
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'anonymous'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- HELPER: get customer.id for the currently authenticated user
-- ============================================================
CREATE OR REPLACE FUNCTION get_customer_id()
RETURNS UUID AS $$
  SELECT id FROM public.customers WHERE auth_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- HELPER: get employee.id for the currently authenticated user
-- ============================================================
CREATE OR REPLACE FUNCTION get_employee_id()
RETURNS UUID AS $$
  SELECT id FROM public.employees WHERE auth_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- HELPER: get department for the currently authenticated employee
-- ============================================================
CREATE OR REPLACE FUNCTION get_employee_department()
RETURNS TEXT AS $$
  SELECT department FROM public.employees WHERE auth_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- TABLE: customers
-- ============================================================
-- Customer: can read/update own row only
-- Employee: can read all customers (to view complaint owner details)
-- CEO: can read all customers
DROP POLICY IF EXISTS "customers_customer_self" ON public.customers;
CREATE POLICY "customers_customer_self" ON public.customers
  FOR ALL USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "customers_employee_read" ON public.customers;
CREATE POLICY "customers_employee_read" ON public.customers
  FOR SELECT USING (get_user_role() IN ('employee', 'ceo'));

-- ============================================================
-- TABLE: employees
-- ============================================================
-- Employees can read their own row
-- CEO can read all employees
DROP POLICY IF EXISTS "employees_self" ON public.employees;
CREATE POLICY "employees_self" ON public.employees
  FOR SELECT USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "employees_ceo_all" ON public.employees;
CREATE POLICY "employees_ceo_all" ON public.employees
  FOR SELECT USING (get_user_role() = 'ceo');

-- ============================================================
-- TABLE: complaints
-- ============================================================
-- Customer: own complaints (via customer_id → get_customer_id())
DROP POLICY IF EXISTS "complaints_customer_own" ON public.complaints;
CREATE POLICY "complaints_customer_own" ON public.complaints
  FOR ALL USING (customer_id = get_customer_id());

-- Employee: complaints in their department
DROP POLICY IF EXISTS "complaints_employee_dept" ON public.complaints;
CREATE POLICY "complaints_employee_dept" ON public.complaints
  FOR SELECT USING (
    get_user_role() = 'employee'
    AND department = get_employee_department()
  );

-- Employee: can update complaints in their department
DROP POLICY IF EXISTS "complaints_employee_update" ON public.complaints;
CREATE POLICY "complaints_employee_update" ON public.complaints
  FOR UPDATE USING (
    get_user_role() = 'employee'
    AND department = get_employee_department()
  );

-- CEO: all complaints
DROP POLICY IF EXISTS "complaints_ceo_all" ON public.complaints;
CREATE POLICY "complaints_ceo_all" ON public.complaints
  FOR SELECT USING (get_user_role() = 'ceo');

-- CEO: can update (add annotations) escalated complaints
DROP POLICY IF EXISTS "complaints_ceo_annotate" ON public.complaints;
CREATE POLICY "complaints_ceo_annotate" ON public.complaints
  FOR UPDATE USING (get_user_role() = 'ceo' AND escalated = TRUE);

-- ============================================================
-- TABLE: messages
-- ============================================================
-- Customer: messages on their own complaints that are visible to customer
DROP POLICY IF EXISTS "messages_customer" ON public.messages;
CREATE POLICY "messages_customer" ON public.messages
  FOR SELECT USING (
    get_user_role() = 'customer'
    AND visible_to_customer = TRUE
    AND complaint_id IN (
      SELECT id FROM public.complaints WHERE customer_id = get_customer_id()
    )
  );

-- Customer: can insert messages on own complaints
DROP POLICY IF EXISTS "messages_customer_insert" ON public.messages;
CREATE POLICY "messages_customer_insert" ON public.messages
  FOR INSERT WITH CHECK (
    get_user_role() = 'customer'
    AND sender_role = 'customer'
    AND complaint_id IN (
      SELECT id FROM public.complaints WHERE customer_id = get_customer_id()
    )
  );

-- Employee: messages on complaints in their department
DROP POLICY IF EXISTS "messages_employee" ON public.messages;
CREATE POLICY "messages_employee" ON public.messages
  FOR ALL USING (
    get_user_role() = 'employee'
    AND complaint_id IN (
      SELECT id FROM public.complaints WHERE department = get_employee_department()
    )
  );

-- CEO: all messages
DROP POLICY IF EXISTS "messages_ceo" ON public.messages;
CREATE POLICY "messages_ceo" ON public.messages
  FOR ALL USING (get_user_role() = 'ceo');

-- ============================================================
-- TABLE: ai_analyses
-- ============================================================
-- Employee: analyses for complaints in their department
DROP POLICY IF EXISTS "ai_analyses_employee" ON public.ai_analyses;
CREATE POLICY "ai_analyses_employee" ON public.ai_analyses
  FOR SELECT USING (
    get_user_role() = 'employee'
    AND complaint_id IN (
      SELECT id FROM public.complaints WHERE department = get_employee_department()
    )
  );

-- CEO: all AI analyses
DROP POLICY IF EXISTS "ai_analyses_ceo" ON public.ai_analyses;
CREATE POLICY "ai_analyses_ceo" ON public.ai_analyses
  FOR SELECT USING (get_user_role() = 'ceo');

-- System insert (service role key bypasses RLS - AI pipeline writes here)

-- ============================================================
-- TABLE: clusters
-- ============================================================
-- CEO only
DROP POLICY IF EXISTS "clusters_ceo" ON public.clusters;
CREATE POLICY "clusters_ceo" ON public.clusters
  FOR SELECT USING (get_user_role() = 'ceo');

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
-- CEO: all audit logs
DROP POLICY IF EXISTS "audit_logs_ceo" ON public.audit_logs;
CREATE POLICY "audit_logs_ceo" ON public.audit_logs
  FOR SELECT USING (get_user_role() = 'ceo');

-- System inserts via service role bypass RLS

-- ============================================================
-- TABLE: api_keys
-- ============================================================
-- CEO: manage API keys
DROP POLICY IF EXISTS "api_keys_ceo" ON public.api_keys;
CREATE POLICY "api_keys_ceo" ON public.api_keys
  FOR ALL USING (get_user_role() = 'ceo');

-- ============================================================
-- TABLE: notifications
-- ============================================================
-- Employee/CEO: own notifications
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (recipient_id = get_employee_id());

-- ============================================================
-- TABLE: faqs
-- ============================================================
-- Public read (FAQs are viewable by all authenticated users)
DROP POLICY IF EXISTS "faqs_public_read" ON public.faqs;
CREATE POLICY "faqs_public_read" ON public.faqs
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- TRIGGER: Auto-create customer/employee profile on auth signup
-- ============================================================
-- When a user is created in auth.users, automatically create corresponding
-- customer or employee record based on user_metadata.role

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is 'customer', create a customer record
  IF NEW.raw_user_meta_data->>'role' = 'customer' THEN
    INSERT INTO public.customers (auth_id, name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email)
    ON CONFLICT (auth_id) DO NOTHING;
  
  -- If role is 'employee' or 'ceo', create an employee record
  ELSIF NEW.raw_user_meta_data->>'role' IN ('employee', 'ceo') THEN
    INSERT INTO public.employees (auth_id, name, email, department, role, is_ceo)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'department', 'Operations'),
      CASE WHEN NEW.raw_user_meta_data->>'role' = 'ceo' THEN 'senior_agent' ELSE 'agent' END,
      NEW.raw_user_meta_data->>'role' = 'ceo'
    )
    ON CONFLICT (auth_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
