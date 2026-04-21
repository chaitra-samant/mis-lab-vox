# CCIS — Development Phases v2 (Backend-First Strategy)

# Customer Complaint Intelligence System

**Version**: 2.0  
**Implementation Strategy**: Backend-First, Test-Driven Development (TDD)  
**Reference**: [prd.md](./prd.md)

---

## Overview

Based on previous technical hurdles (e.g., Supabase connection issues, frontend-backend mismatches), the development methodology is completely restructured.

This v2 roadmap strictly isolates backend development from the frontend, ensuring the entire database, API layer, and AI ecosystem are 100% operational and audited through automated test cases _before_ any frontend integration begins. The existing Lovable UI will serve as a mock-driven foundation, modified in an isolated phase, before the two are finally wired together.

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

- [x] **Infrastructure**: Connect to Supabase and initialize environments (`.env.local` templates).
- [x] **Schema Definition**: Tables for `complaints`, `customers`, `employees`, `messages`, `ai_analyses`, `clusters`, `audit_logs`, `api_keys`.
- [x] **Relationships & Constraints**: Strict foreign keys and cascading rules.
- [x] **Security (RLS)**: Enforce policies at the database layer (e.g., users can only read their own data; employees read their department; CEO reads all).
- [x] **Auth Layer**: Setup Supabase Auth hooks and triggers linking `auth.users` to the custom tables.
- [x] **Seed Script**: A reproducible script (`seed.sql` or `seed.ts`) that wipes the DB and inserts a controlled, predictable dataset for testing.

### Testcases & Auditing (Backend Test Runner, e.g., Supabase pgTAP or Jest DB Tests)

| Test Case ID | Target            | Testing Method                               | Expected Result                                              |
| ------------ | ----------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `DB-01`      | Table Structures  | Schema inspection assert                     | All 8 tables exist with precise typings.                     |
| `DB-02`      | Cascading Deletes | Delete a test customer                       | Related complaints and messages are deleted safely.          |
| `DB-03`      | RLS - Customer    | Authenticate query as 'Customer A'           | Returns ONLY Customer A's complaints; blocked from others.   |
| `DB-04`      | RLS - Employee    | Authenticate query as 'Employee B' (Billing) | Returns ONLY Billing dept complaints.                        |
| `DB-05`      | RLS - CEO         | Authenticate query as 'CEO'                  | Returns full global dataset.                                 |
| `DB-06`      | Trigger - Auth    | Insert into `auth.users`                     | Trigger auto-creates corresponding profile record.           |
| `DB-07`      | Seed Execution    | Run seed script                              | Predictable DB state (e.g., exactly 50 complaints inserted). |

**Gate**: Automated test suite must pass directly against the database with 100% success. No UI required.
