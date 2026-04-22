# CCIS — Development Phases v2 (Backend-First Strategy)
# Customer Complaint Intelligence System

**Version**: 2.0  
**Implementation Strategy**: Backend-First, Test-Driven Development (TDD)  
**Reference**: [prd.md](./prd.md)

---

## Overview

Based on previous technical hurdles (e.g., Supabase connection issues, frontend-backend mismatches), the development methodology is completely restructured. 

This v2 roadmap strictly isolates backend development from the frontend, ensuring the entire database, API layer, and AI ecosystem are 100% operational and audited through automated test cases *before* any frontend integration begins. The existing Lovable UI will serve as a mock-driven foundation, modified in an isolated phase, before the two are finally wired together.

**Browser testing is completely eliminated from the initial phases and reserved exclusively for the Final Integration (Phase 5).**

### Roadmap Hierarchy
```text
Phase 1: DB & Schema → Unit Tested
Phase 2: Core APIs & Services → API Tested
Phase 3: AI & Intelligence Layer → Integration Tested (Mocked)
Phase 4: Frontend UI (Lovable Refinement) → Component Tested
Phase 5: Full Integration & Real-Time Setup → E2E Browser Tested
```

---

## Phase 1 — Data Layer & Infrastructure (Backend)

### Goal
Establish the absolute bedrock. Set up the exact database schema, constraints, relationships, Row Level Security (RLS) policies, and authentication mechanisms directly in Supabase.

### Deliverables
- [ ] **Infrastructure**: Connect to Supabase and initialize environments (`.env.local` templates).
- [ ] **Schema Definition**: Tables for `complaints`, `customers`, `employees`, `messages`, `ai_analyses`, `clusters`, `audit_logs`, `api_keys`.
- [ ] **Relationships & Constraints**: Strict foreign keys and cascading rules.
- [ ] **Security (RLS)**: Enforce policies at the database layer (e.g., users can only read their own data; employees read their department; CEO reads all).
- [ ] **Auth Layer**: Setup Supabase Auth hooks and triggers linking `auth.users` to the custom tables.
- [ ] **Seed Script**: A reproducible script (`seed.sql` or `seed.ts`) that wipes the DB and inserts a controlled, predictable dataset for testing.

### Testcases & Auditing (Backend Test Runner, e.g., Supabase pgTAP or Jest DB Tests)
| Test Case ID | Target | Testing Method | Expected Result |
|---|---|---|---|
| `DB-01` | Table Structures | Schema inspection assert | All 8 tables exist with precise typings. |
| `DB-02` | Cascading Deletes | Delete a test customer | Related complaints and messages are deleted safely. |
| `DB-03` | RLS - Customer | Authenticate query as 'Customer A' | Returns ONLY Customer A's complaints; blocked from others. |
| `DB-04` | RLS - Employee | Authenticate query as 'Employee B' (Billing) | Returns ONLY Billing dept complaints. |
| `DB-05` | RLS - CEO | Authenticate query as 'CEO' | Returns full global dataset. |
| `DB-06` | Trigger - Auth | Insert into `auth.users` | Trigger auto-creates corresponding profile record. |
| `DB-07` | Seed Execution | Run seed script | Predictable DB state (e.g., exactly 50 complaints inserted). |

**Gate**: Automated test suite must pass directly against the database with 100% success. No UI required.

---

## Phase 2 — Core API & Business Logic (Backend)

### Goal
Wrap the database with robust API services (Supabase Edge Functions, Node/Next.js API routes, or standalone backend). This phase handles the logic that the DB shouldn't, like validation, email triggers, and SLA cron jobs.

### Deliverables
- [ ] **CRUD Services**: Complete endpoints for complaint submission (with validation), updates, assignment, and messaging.
- [ ] **Business Logic Constraints**: Enforce state transition rules (e.g., `RESOLVED` -> `CLOSED`, but not `CLOSED` -> `IN_PROGRESS`).
- [ ] **Audit Logging Engine**: Ensure every destructive or state-changing API call writes to `audit_logs`.
- [ ] **SLA Engine**: Implement batch scripts/cron jobs for SLA countdowns and auto-escalation.
- [ ] **Notifications/Email**: Stub/integrate Resend or Supabase email triggers on specific events (resolution, escalation).

### Testcases & Auditing (API Testing Framework, e.g., Jest + Supertest / Bruno)
| Test Case ID | Target | Testing Method | Expected Result |
|---|---|---|---|
| `API-01` | Complaint Submit | POST payload with missing fields | Returns HTTP 400 with strict validation errors via Zod. |
| `API-02` | Complaint Submit | POST valid payload | Returns HTTP 201; creates complaint in DB with `OPEN` status. |
| `API-03` | Status Transition | PATCH status `CLOSED` -> `OPEN` | Returns HTTP 403 (Invalid State Transition). |
| `API-04` | Audit Middleware | PATCH complaint priority | `audit_logs` table receives 1 localized exact entry matching action. |
| `API-05` | SLA Auto-Escalate | Execute SLA cron job manually | Complaints older than SLA deadline transitioned to `escalated = true`. |
| `API-06` | Email Trigger | Trigger resolution endpoint | Mock email service receives standard transactional email payload. |

**Gate**: API test suite executes successfully locally. Postman/Bruno collection documented for frontend readiness.

---

## Phase 3 — AI & Intelligence Microservice (Backend)

### Goal
Build and audit the Python/Langchain microservice that powers intelligent routing, sentiment analysis, clustering, and semantic search. It operates purely as an API accepting inputs and returning structured JSON.

### Deliverables
- [ ] **AI Router Service**: Standalone API (FastAPI) accepting complaint text.
- [ ] **Classification Pipeline**: Categorization, urgency scoring, sentiment analysis pipeline.
- [ ] **Generative Summaries**: LLM call to reduce complaint descriptions to 2-3 sentences.
- [ ] **Clustering Engine**: Batch embedding generator to find "Root Cause Clusters".
- [ ] **Churn Script**: Script analyzing frequencies + sentiments to update `churn_risk_score`.

### Testcases & Auditing (Python `pytest`)
| Test Case ID | Target | Testing Method | Expected Result |
|---|---|---|---|
| `AI-01` | Semantic Routing | Run 50 known text samples against classification endpoint | Accuracy > 90% against ground truth labels. |
| `AI-02` | Sentiment Edge Case | Feed explicitly sarcastic text | Returns correct Sentiment score (e.g., Negative). |
| `AI-03` | Token Limit Handler | Feed 10,000-word spam text | AI safely truncates/handles without HTTP 500. |
| `AI-04` | Clustering Batch | Execute DB embedding generation script | Returns distinct groupings of similar test complaints. |
| `AI-05` | AI Payload Format | Verify API response shapes | Response strictly matches required JSON Schema (no raw markdown leaks). |

**Gate**: `pytest` suite passes with mocked external LLMs to ensure pipeline integrity.

---

## Phase 4 — Frontend Foundation & Refinement (Mocked UI)

### Goal
Take the existing Lovable UI codebase, which serves as a great starting blueprint, and refine it to strictly match the PRD layouts. **No real backend connections are made here.** All dynamic states are explicitly mocked. 

### Deliverables
- [ ] **Design System Lock-in**: Finalize CSS, global styles, variables, and core responsive components.
- [ ] **Router & Shell Restructuring**: Align the Next.js/Vite routing to `/customer`, `/employee`, `/ceo`.
- [ ] **Customer Portal UI**: Feedback flows, multi-step complaint forms, timelines (running on mock JSON files).
- [ ] **Employee Portal UI**: Inbox queues, chat interfaces, intelligence panel overlays.
- [ ] **CEO Portal UI**: KPI charts, root cause visualization, churn tables mapping to mock data arrays.

### Testcases & Auditing (Component Testing, e.g., Vitest / React Testing Library)
| Test Case ID | Target | Testing Method | Expected Result |
|---|---|---|---|
| `UI-01` | Portal Routing | Render unauthenticated state | Navigation securely blocked; login form required. |
| `UI-02` | Employee Queue | Pass mock array of 100 complaints | Table renders with correct pagination and status badges. |
| `UI-03` | File Upload UI | Trigger standard mock upload | UI shows correct loading, progress, and success states. |
| `UI-04` | CEO Charting | Pass mock financial data | Line, Bar, and Pie components render without JS errors. |
| `UI-05` | Accessibility Audits | Run Axe/Lighthouse automated tools | Forms have ARIA labels, contrast ratio passes WCAG. |

**Gate**: Frontend builds securely. Component tests completely clear out UI-specific rendering bugs.

---

## Phase 5 — Full Integration & Real-Time Wiring (Full Stack)

### Goal
Drop the mock data. Connect the Phase 4 UI directly to the Phase 2 & 3 Backend APIs using Supabase clients. This is the only phase where browser integration mapping, real-time WebSocket bindings, and end-to-end journey tests occur.

### Deliverables
- [ ] **API Client Migration**: Swap all local mocked JSON endpoints for live Supabase Client / React Query calls.
- [ ] **Real-time Subscriptions**: Wire up Supabase Realtime for the CEO dashboard and employee chat feeds.
- [ ] **Auth Hydration**: Tie frontend protected routes to real Supabase session cookies/JWTs.
- [ ] **Error Handling**: Implement global toast notifications natively bound to real API HTTP errors.

### Testcases & Auditing (End-to-End Browser Testing, e.g., Playwright or Cypress)
| Test Case ID | Target | Testing Method | Expected Result |
|---|---|---|---|
| `E2E-01` | Complete Customer Flow| Scripted headless browser: Login -> Submit -> View Status | Complaint visibly appears in DB; confirmation toast rendered. |
| `E2E-02` | Complete Employee Flow| Headless: Login -> Pick up complaint -> Reply -> Resolve | Status propagates back to customer view. |
| `E2E-03` | Real-time Dashboard | Open 2 windows: submit a complaint in window 1 | Window 2 (CEO dashboard) live-updates the active complaint count. |
| `E2E-04` | Upload Integration | Scripted file attach using local binary file | File reaches Supabase storage bucket successfully. |
| `E2E-05` | Session Management | Scripted logout / tab refresh | Session state properly destroyed and login shell enforced. |

**Gate**: E2E automated suite passes reliably. System is functionally complete and production-ready.