# CCIS — Development Phases
# Customer Complaint Intelligence System

**Version**: 1.0  
**Date**: April 2026  
**Implementation Method**: Antigravity (AI-assisted, phase-wise development)  
**Reference**: [prd.md](./prd.md)

---

## Overview

Development is divided into **5 phases**. Each phase delivers a working, testable vertical slice of the system. Antigravity builds each phase as a self-contained unit, and no phase begins until the previous phase has passed testing.

```
Phase 1 → Test → Phase 2 → Test → Phase 3 → Test → Phase 4 → Test → Phase 5 → Test → LAUNCH
```

| Phase | Name | Focus | Duration |
|---|---|---|---|
| 1 | Foundation | Schema, Auth, Routing, Design System | ~2 weeks |
| 2 | Customer Portal | Complaint form, tracking, suggestions | ~1.5 weeks |
| 3 | Employee Portal | Queue, detail view, resolution, SLA | ~2 weeks |
| 4 | CEO Dashboard | KPIs, escalations, reports, API mgmt | ~2 weeks |
| 5 | AI & Intelligence | All AI features end-to-end | ~2.5 weeks |

**Total Estimated Duration**: ~10 weeks (within the 63-day critical path).

---

## Phase 1 — Foundation

### Goal
Establish the complete project skeleton: database schema, authentication, role-based routing, and the global design system. No actor can do anything meaningful yet, but every page shell and route is wired.

### PRD Sections Covered
- §4 System Architecture
- §8 Database Schema
- §9 Security & Access Control (Auth + RLS)
- §13.1 Design System

### Deliverables

#### 1.1 Project Setup
- [ ] Initialize Next.js 14 project with Tailwind CSS.
- [ ] Connect Supabase project (database URL, anon key, service role key).
- [ ] Create an `.env.example` template covering all required credentials (Supabase URL, Anon Key, Groq API Key). The user will duplicate this to `.env.local` and add real keys.
- [ ] Verify local development server runs correctly (`npm run dev`). No Vercel deployment required.

#### 1.2 Database Schema
- [ ] Create all Supabase tables: `complaints`, `customers`, `employees`, `messages`, `ai_analyses`, `clusters`, `audit_logs`, `api_keys`.
- [ ] Define all foreign key relationships and constraints.
- [ ] Apply RLS policies per §9.2 (Customer, Employee, CEO).
- [ ] Create a `seed.ts` or `seed.sql` script to establish the schema and populate realistic data.
- [ ] **Demo Context**: The system will act as the MIS for "**AuraBank**", a digital banking company. Complaints will feature realistic scenarios (e.g., blocked cards, hidden fees, app crashes, failed UPI transfers).
- [ ] Execute script to seed database (10 customers, 5 employees, 50 AuraBank complaints in various states).

#### 1.3 Authentication
- [ ] Configure Supabase Auth (email/password + magic link for customers).
- [ ] Set up `auth.users` → `employees` / `customers` linkage via metadata.
- [ ] Implement login, logout, and session persistence across all portals.
- [ ] Role detection logic: on login, redirect user to correct portal based on role.

#### 1.4 Route Structure
- [ ] `/` — Landing page (unauthenticated, links to all three portals).
- [ ] `/customer/*` — Customer portal shell.
- [ ] `/employee/*` — Employee portal shell.
- [ ] `/ceo/*` — CEO dashboard shell.
- [ ] Protected route middleware: redirect unauthenticated users to login.

#### 1.5 Design System
- [ ] Define global CSS variables: colors, typography (Inter), spacing, border-radius.
- [ ] Implement portal accent colors (Customer: Blue, Employee: Indigo, CEO: Violet).
- [ ] Create reusable component stubs: Button, Card, Badge, Table, Modal, Input, Sidebar, Navbar.
- [ ] Implement responsive layout shell for all three portals.

### Phase 1 Testing Checklist

| Test | Method | Pass Criteria |
|---|---|---|
| Database tables exist with correct columns | Supabase dashboard inspection | All 8 tables present |
| RLS: Customer cannot read another customer's complaint | Supabase RLS policy test | Query returns 0 rows |
| RLS: Employee can only read their department's complaints | Supabase RLS policy test | Filtered rows only |
| RLS: CEO can read all complaints | Supabase RLS policy test | All rows returned |
| Customer login → redirected to `/customer` | Browser test | ✅ |
| Employee login → redirected to `/employee` | Browser test | ✅ |
| CEO login → redirected to `/ceo` | Browser test | ✅ |
| Unauthenticated access to `/employee` → redirected to login | Browser test | ✅ |
| Design system tokens applied globally | Visual inspection | ✅ |
| Local dev server runs without errors | Visit `http://localhost:3000` | ✅ |

> **Phase 1 Gate**: All 10 tests must pass before Phase 2 begins.

---

## Phase 2 — Customer Portal

### Goal
Build the complete Customer experience: complaint submission with all form fields, instant self-help suggestions, complaint tracking dashboard, and post-resolution feedback. No AI analysis yet — the form submits raw and the tracking page shows status from the database.

### PRD Sections Covered
- §5.1 Customer Portal (all subsections)
- §13.2 Customer Portal UX
- §13.3 Notifications (customer-facing)

### Deliverables

#### 2.1 Complaint Submission Form
- [ ] Multi-field form (all fields per §5.1.1): name, email, phone, product, category, description, attachments, preferred resolution, estimated financial loss, consent.
- [ ] Client-side validation (required fields, min-length description, file size limits).
- [ ] Server-side validation (Supabase insert with constraints).
- [ ] File attachment upload to Supabase Storage (max 3 files, 5MB each).
- [ ] On submit: complaint stored with `status = OPEN`, `source = web_form`.
- [ ] Confirmation screen with complaint ID and expected resolution time.
- [ ] Send confirmation email (via Supabase or Resend.dev) with complaint ID.

#### 2.2 Instant Resolution Suggestions
- [ ] Before form submission, analyze description field (basic keyword matching — no AI yet).
- [ ] Match against a static FAQ/suggestion table seeded in Supabase.
- [ ] Surface matched suggestions inline with links.
- [ ] "This resolved my issue" button → log deflection, allow form dismissal.
- [ ] Suggestion dismissal does not prevent form submission.

#### 2.3 Complaint Tracking Dashboard
- [ ] `/customer/complaints` — List of all complaints by the logged-in customer.
- [ ] Timeline component for each complaint (Submitted → Under Review → Resolved / Escalated).
- [ ] Status badge with color coding (Open, In Progress, Escalated, Resolved, Closed).
- [ ] Last updated timestamp.
- [ ] Expandable view to see employee messages (read-only).
- [ ] Resolution note (shown after `RESOLVED`).

#### 2.4 Post-Resolution Feedback
- [ ] After status changes to `RESOLVED`, customer sees feedback prompt on complaint detail.
- [ ] 1–5 star rating + optional comment.
- [ ] Submit saves to `feedback_rating` and `feedback_text` fields on complaint.
- [ ] Feedback once submitted cannot be edited.

### Phase 2 Testing Checklist

| Test | Method | Pass Criteria |
|---|---|---|
| All form fields submit and persist to Supabase | Submit form → check DB | All fields saved |
| Required field validation fires | Attempt submit without required fields | Errors shown |
| File upload works and stored in Supabase Storage | Upload 3 files → check storage | Files accessible |
| File size limit enforced (>5MB rejected) | Upload large file | Error shown |
| Confirmation email sent with correct complaint ID | Check inbox | ✅ |
| Complaint status timeline renders correctly | View complaint after submission | Status = OPEN shown |
| Customer can only see own complaints | Log in as 2 different customers | No cross-contamination |
| Self-help suggestion appears for known keywords | Type known keyword in description | Suggestion card shown |
| Deflection log recorded on "resolved by suggestion" | Click resolved → check DB | Deflection row saved |
| Feedback form shown only after RESOLVED status | Set complaint to RESOLVED in DB | Prompt appears |
| Feedback saves to DB | Submit feedback | rating + text in complaints table |
| Mobile responsive layout | Test at 375px viewport | No overflow, usable |

> **Phase 2 Gate**: All 12 tests must pass before Phase 3 begins.

---

## Phase 3 — Employee Portal

### Goal
Build the full Employee workspace: complaint queue with filters, detailed complaint view, resolution actions, internal notes, customer messaging, manual escalation, and employee analytics. RLS enforced. No AI panel yet (placeholder shown).

### PRD Sections Covered
- §5.2 Employee Portal (all subsections)
- §10.2 Manual Escalation
- §10.3 Post-Escalation (annotations)
- §11 Financial Loss (display only, no AI estimation yet)
- §13.2 Employee Portal UX
- §13.3 Notifications (employee-facing)
- §9.3 Audit Logging (employee actions)

### Deliverables

#### 3.1 Complaint Queue
- [ ] `/employee/complaints` — Main view with tab switcher: My Complaints / Department Queue / Escalated.
- [ ] Table with columns: Complaint ID, Customer Name, Category, Status, Priority, Assigned To, Submitted, SLA Deadline, Escalated flag.
- [ ] Filter panel: Status, Category, Priority, Date Range, Escalation.
- [ ] Sort by: Date Submitted, Priority, SLA Deadline.
- [ ] Keyword search across Complaint ID, Customer Name, description keywords.
- [ ] SLA countdown indicator (color turns red when < 1 hour remaining).

#### 3.2 Complaint Detail View
- [ ] `/employee/complaints/[id]` — Full detail page.
- [ ] Complaint Info section: all original form fields, read-only.
- [ ] AI Intelligence Panel: **placeholder** — shows "AI analysis pending…" card (populated in Phase 5).
- [ ] Financial Impact: shows customer-reported value with "(AI estimate pending)" if no customer value.
- [ ] Communication Log: threaded message view between employee and customer.
- [ ] Action Panel:
  - Update Status (Open → In Progress → Resolved → Closed) — status select + save.
  - Add Internal Note (internal = true, not visible to customer).
  - Send Message to Customer (internal = false, visible to customer, triggers email notification).
  - Escalate button: requires justification text > 20 characters.
  - Reassign: dropdown of other employees in same department.

#### 3.3 Escalation
- [ ] Escalate action sets `complaints.escalated = true` and saves `escalation_reason`.
- [ ] Escalated complaint immediately appears in CEO's escalated panel (via Supabase real-time).
- [ ] Employee receives in-app notification confirming escalation.
- [ ] Audit log entry created for escalation action.

#### 3.4 Employee Analytics
- [ ] `/employee/analytics` — Personal metrics page.
- [ ] Metrics: Resolved count (period picker), Avg resolution time, CSAT score, Escalation rate.
- [ ] Complaint volume by category (bar chart).
- [ ] SLA adherence rate (% resolved before deadline).

#### 3.5 SLA Management
- [ ] SLA deadline auto-calculated on complaint creation (category-based defaults: Billing 24h, Technical 48h, Service 72h, Other 48h).
- [ ] SLA countdown shown in complaint table and detail view.
- [ ] Auto-escalation: cron job (Supabase Edge Function) checks every hour and escalates complaints breaching SLA with status not RESOLVED.

#### 3.6 Notifications
- [ ] In-app notification bell in employee navbar.
- [ ] Notification events: new complaint assigned, escalation triggered, SLA warning (1h before), CEO annotation added.
- [ ] Notifications stored in a `notifications` table and marked read on click.

#### 3.7 Audit Logging
- [ ] Log all employee actions: status change, message sent, escalation, reassignment, note added.
- [ ] `audit_logs` table populated on every action.

### Phase 3 Testing Checklist

| Test | Method | Pass Criteria |
|---|---|---|
| Employee only sees their department complaints in Department Queue | Log in as Employee (Dept A) | No other dept complaints |
| Filter by Status works correctly | Apply status filter | Correct results |
| SLA countdown shows correctly | Check complaint with known deadline | Correct time remaining |
| SLA color turns red < 1 hour | Set deadline to 30 min from now in DB | Red indicator |
| Send message to customer — customer sees it | Send message → log in as customer | Message visible |
| Customer email notification sent on message | Send message → check inbox | Email received |
| Internal note NOT visible to customer | Add internal note → log in as customer | Note absent |
| Escalation sets DB flag and escalation_reason | Escalate complaint | `escalated=true` in DB |
| Escalated complaint appears in CEO view (real-time) | Escalate → open CEO tab | Complaint appears instantly |
| Reassign changes assigned_to in DB | Reassign to Employee B | DB updated |
| Auto-escalation fires on SLA breach | Set deadline to past in DB → wait | `escalated=true` auto-set |
| Audit log created for every action | Perform 5 actions → check audit_logs | 5 rows created |
| Employee Analytics metrics correct | Cross-check with DB aggregates | Values match |
| Status change to RESOLVED → customer notified | Resolve complaint → check customer email | Email sent |
| Notification bell shows unread count | New assignment → check bell | Count updated |

> **Phase 3 Gate**: All 15 tests must pass before Phase 4 begins.

---

## Phase 4 — CEO Dashboard

### Goal
Build the complete CEO experience: real-time KPI cards, escalated complaints panel (with annotations), root-cause clusters (manual/static for now), churn risk table, financial loss charts, semantic search (stub), executive report generation, API key management, and live real-time updates.

### PRD Sections Covered
- §5.3 CEO Dashboard (all subsections)
- §10.3 Post-Escalation (CEO annotations)
- §11 Financial Loss (display and charts)
- §12 API Integration (management UI)
- §13.2 CEO Dashboard UX
- §13.3 Notifications (CEO-facing)

### Deliverables

#### 4.1 KPI Overview
- [ ] `/ceo/dashboard` — Main page with KPI cards.
- [ ] Cards: Total Active Complaints, Avg Resolution Time, Resolution Rate, Escalation Rate, CSAT Score, Total Financial Exposure, Churn Risk Count.
- [ ] All values pulled from live Supabase aggregation queries.
- [ ] Real-time updates via Supabase subscriptions (values refresh without page reload).
- [ ] Period picker (today / 7 days / 30 days / custom).

#### 4.2 Escalated Complaints Panel
- [ ] `/ceo/escalated` — Dedicated section.
- [ ] Table of all escalated complaints (all departments) sorted by escalation time.
- [ ] Columns: Complaint ID, Customer, Department, Escalation Reason, Time Escalated, Financial Impact.
- [ ] One-click to open full complaint read-only view.
- [ ] CEO annotation input: text box to add executive note (saved to `messages` with `sender_role = CEO`).
- [ ] New escalation → real-time in-app notification for CEO.

#### 4.3 Root-Cause Clusters
- [ ] `/ceo/clusters` — Cluster view.
- [ ] **Phase 4 version**: Static/manual clusters seeded from dummy data (dynamic AI clustering in Phase 5).
- [ ] Each cluster: label, complaint count, financial impact total, trend sparkline.
- [ ] Click cluster → modal/drawer with list of constituent complaints.

#### 4.4 Churn Risk Table
- [ ] `/ceo/churn` — Churn risk view.
- [ ] Table: Customer Name, Email, Churn Risk Score (0–100), Color badge (Low/Med/High), Complaint Count, Last Complaint Date.
- [ ] **Phase 4 version**: Churn risk score manually seeded on `customers` table (AI scoring in Phase 5).
- [ ] Sort by risk score descending.
- [ ] Trend indicator: is score trending up or down?

#### 4.5 Financial Loss Analysis
- [ ] `/ceo/financial` — Financial view.
- [ ] Total exposure number (large, prominent).
- [ ] Category-wise breakdown (pie chart + bar chart side by side).
- [ ] Monthly trend line chart (last 6 months).
- [ ] Top 10 highest-impact complaints table.
- [ ] Customer-reported vs. AI-estimated comparison (placeholder for AI column in Phase 4).

#### 4.6 Semantic Search (Stub)
- [ ] `/ceo/search` — Search page.
- [ ] Query input text box.
- [ ] **Phase 4 version**: Returns hardcoded/mocked response for known queries (real AI in Phase 5).
- [ ] Result area shows: summary text + data table of supporting complaints.

#### 4.7 Executive Reports
- [ ] Report generation button with date-range picker.
- [ ] **CSV report**: Raw complaint data with key fields, exportable immediately.
- [ ] **PDF report** (Phase 4): Basic PDF using `jsPDF` or `react-pdf` with KPI summary + category breakdown.
- [ ] Download triggers tracked in audit log.

#### 4.8 API Integration Management
- [ ] `/ceo/api` — API management page.
- [ ] Table of all API keys (label, created date, last used, usage count, status).
- [ ] "Generate New Key" — creates key, stores hashed key in `api_keys` table, shows raw key once only.
- [ ] Revoke key — sets `active = false`.
- [ ] Link to API documentation page (static MDX page).

#### 4.9 Notifications
- [ ] In-app notification: new escalation → CEO bell shows count.
- [ ] In-app notification: new high-churn customer flagged (score crosses 70 threshold on update).

### Phase 4 Testing Checklist

| Test | Method | Pass Criteria |
|---|---|---|
| KPI values match DB aggregates | Compare UI values with manual SQL | Values match |
| Real-time KPI update when complaint added | Add complaint in DB → watch dashboard | Value updates within 2s |
| Escalated complaints panel shows all escalated | Verify against DB | Count matches |
| CEO annotation saved and visible to employee | Add annotation → check employee view | Note present |
| CEO cannot change complaint status | Inspect action panel on CEO view | No status controls |
| Root-cause cluster modal shows correct complaints | Click cluster → verify IDs | Correct IDs |
| Churn risk table sorted correctly | Verify highest score at top | ✅ |
| Financial pie chart totals match KPI exposure | Sum chart slices | Matches total card |
| Monthly trend chart shows last 6 months | Visual inspection + data check | ✅ |
| Top 10 complaints correct | Cross-check with DB sort | ✅ |
| CSV export contains correct data | Download and open | Correct columns and rows |
| PDF export generates without error | Click PDF export | File downloaded |
| API key generated and stored (hashed) | Generate key → check api_keys table | Raw key shown once, hash stored |
| API key revocation sets active=false | Revoke → check DB | `active=false` |
| CEO notification for escalation | Escalate from Employee tab → CEO tab | Bell count increments |
| Period picker changes all KPI values | Switch to 7-day | Values recalculated |

> **Phase 4 Gate**: All 16 tests must pass before Phase 5 begins.

---

## Phase 5 — AI & Intelligence Layer

### Goal
Wire up the full Python/LangChain AI pipeline. Replace all Phase 4 stubs and placeholders with real AI functionality: classification, sentiment analysis, AI summaries, churn scoring, root-cause clustering, financial loss estimation, semantic search, and suggested responses.

### PRD Sections Covered
- §6 AI & Intelligence Layer (all subsections)
- §6.1 Complaint Classification
- §6.2 Sentiment Analysis
- §6.3 AI Summary Generation
- §6.4 Suggested Response Templates
- §6.5 Financial Loss Estimation
- §6.6 Churn Risk Scoring
- §6.7 Root-Cause Clustering
- §6.8 Semantic Search
- §5.2.2 Employee AI Intelligence Panel (live)
- §5.1.2 Customer Instant Suggestions (AI-powered upgrade)

### Deliverables

#### 5.1 AI Pipeline Setup
- [ ] Set up Python microservice (FastAPI or Flask) hosted separately (Railway / Render / fly.io).
- [ ] Connect application to Groq API (using Llama models, with `agno` if agentic workflows are needed).
- [ ] Set up vector store (Supabase `pgvector` or Pinecone) for complaint embeddings.
- [ ] Supabase Webhook → Python microservice triggered on every new complaint insert.

#### 5.2 Complaint Classification
- [ ] On new complaint: classify category (validate/correct customer selection) + subcategory + urgency.
- [ ] Result written to `ai_analyses` table.
- [ ] If AI classification differs from customer-selected category: flag for employee review.

#### 5.3 Sentiment Analysis
- [ ] On new complaint: analyze description for sentiment (Positive / Neutral / Negative) + confidence score.
- [ ] Written to `ai_analyses`.
- [ ] Sentiment affects priority score recalculation on complaint.

#### 5.4 AI Summary Generation
- [ ] On new complaint: generate 2–3 sentence summary of the complaint.
- [ ] Written to `ai_analyses.summary`.
- [ ] Employee AI Intelligence Panel now shows live summary (replaces Phase 3 placeholder).

#### 5.5 Suggested Response Templates
- [ ] Based on category + sentiment + urgency: generate suggested response for employee.
- [ ] Written to `ai_analyses.suggested_response`.
- [ ] Employee sees "Use this response" button in action panel — pre-fills message box.

#### 5.6 Financial Loss Estimation
- [ ] For complaints with no customer-provided financial loss: AI estimates based on category + product + description.
- [ ] Written to `ai_analyses` and surfaced in employee and CEO views with "~" label.
- [ ] CEO financial charts now include AI-estimated values for previously empty complaints.

#### 5.7 Churn Risk Scoring
- [ ] Batch job (daily): for every customer with complaints in last 90 days, recalculate churn risk score.
- [ ] Inputs: complaint frequency, avg sentiment, complaint age, language heat (CAPS, exclamation marks, strong emotional words).
- [ ] Written to `customers.churn_risk_score`.
- [ ] CEO churn table now shows live AI-generated scores.
- [ ] Trigger: if score crosses 70 threshold, fire CEO notification.

#### 5.8 Root-Cause Clustering
- [ ] Daily batch job: generate embeddings for all new complaints (since last run).
- [ ] Cluster embeddings using DBSCAN or k-means.
- [ ] Use LLM to generate human-readable cluster label from constituent complaints.
- [ ] Write clusters to `clusters` table.
- [ ] CEO cluster view now shows AI-generated dynamic clusters.

#### 5.9 Semantic Search (Live)
- [ ] CEO query input → sent to Groq-powered QA agent (via Agno).
- [ ] Chain retrieves relevant complaint embeddings from vector store.
- [ ] LLM generates a natural language summary answer + returns supporting complaint IDs.
- [ ] Results rendered as summary text + complaint data table.
- [ ] Example queries smoke-tested: financial loss, churn drivers, escalation patterns.

#### 5.10 Customer Instant Suggestions (AI-Powered Upgrade)
- [ ] Replace Phase 2 keyword-matching with LLM-based suggestion.
- [ ] Description → LLM → top 3 relevant FAQ articles/self-help cards from knowledge base.
- [ ] Latency target: < 3 seconds (async, non-blocking form submission).

#### 5.11 Priority Score Recalculation
- [ ] After AI pipeline completes: recalculate complaint priority using:
  - Sentiment score (weight: 30%)
  - AI urgency classification (weight: 40%)
  - Financial loss estimate (weight: 20%)
  - SLA remaining (weight: 10%)
- [ ] Updated priority written back to `complaints.priority`.
- [ ] Employee queue re-sorts automatically.

### Phase 5 Testing Checklist

| Test | Method | Pass Criteria |
|---|---|---|
| AI pipeline triggered on complaint insert | Submit complaint → check ai_analyses table | Row created within 30s |
| Classification accuracy (sample of 20 complaints) | Manual review | ≥ 90% correct |
| Sentiment analysis returns valid label + score | Check ai_analyses | Label in [Positive, Neutral, Negative], score 0–1 |
| AI summary is 2–3 sentences and coherent | Read 10 summaries | ✅ |
| Suggested response template reasonable | Check 10 templates | ✅ |
| AI financial estimate present for complaints without customer value | Check ai_analyses.financial_loss_estimate | Non-null for target complaints |
| AI churn score calculated for all customers with recent complaints | Daily batch run → check customers table | Scores populated |
| Churn score > 70 triggers CEO notification | Set score to 75 → check notifications | Notification created |
| Clusters generated and labeled meaningfully | Run batch → check clusters table | ≥ 3 clusters, human-readable labels |
| CEO semantic search returns relevant answer | Query: "What caused most losses last month?" | Relevant response |
| AI suggestions upgrade in customer portal works | Type complaint → see AI suggestions | Suggestions shown < 3s |
| Priority score recalculated post-AI | Check complaint priority before vs after AI | Priority updated |
| Auto-escalation fires when sentiment=Negative + financial_loss > ₹10,000 | Create such a complaint | `escalated=true` auto-set |
| AI pipeline failure does not block complaint submission | Disable AI service → submit complaint | Complaint saved, AI retried later |
| End-to-end: submit complaint → Employee sees AI panel → CEO sees cluster | Full flow test | Complete ✅ |

> **Phase 5 Gate**: All 15 tests must pass → **System is ready for launch**.

---

## Final Launch Checklist

Before declaring the system production-ready:

- [ ] All 5 phase test gates passed.
- [ ] System runs perfectly on localhost.
- [ ] All environment variables secured (not in code).
- [ ] RLS policies audited — no unintended data access.
- [ ] API rate limiting active.
- [ ] Audit logging verified across all actor actions.
- [ ] CSAT feedback flow end-to-end verified.
- [ ] PDF and CSV export tested with real data.
- [ ] Accessibility audit (WCAG 2.1 AA) passed.
- [ ] Load test: simulate 500 concurrent complaint submissions.
- [ ] CEO reports generation tested with 1000+ complaint dataset.
- [ ] Documentation page for API published.

---

## Phase Summary Table

| Phase | What's Built | What Actors Can Do | AI Used? |
|---|---|---|---|
| 1 | Schema, Auth, Routing, Design System | Log in + see portal shells | ❌ |
| 2 | Customer Portal (full) | Submit complaints, track status, give feedback | Partial (keyword suggestions) |
| 3 | Employee Portal (full) | Manage, resolve, escalate complaints | ❌ (placeholder panel) |
| 4 | CEO Dashboard (full) | View KPIs, escalations, reports, manage API | ❌ (stubs for AI sections) |
| 5 | AI & Intelligence Layer | All AI features live across all portals | ✅ Full |

---

*End of Phase Plan — CCIS v1.0*
