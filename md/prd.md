# Product Requirements Document (PRD)
# Customer Complaint Intelligence System (CCIS)

**Version**: 1.0  
**Date**: April 2026  
**Author**: Chaitra Samant (231070055)  
**Status**: Draft  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Objectives & Goals](#2-objectives--goals)
3. [Actors & Roles](#3-actors--roles)
4. [System Architecture](#4-system-architecture)
5. [Functional Requirements](#5-functional-requirements)
   - 5.1 [Customer Portal](#51-customer-portal)
   - 5.2 [Employee Portal](#52-employee-portal)
   - 5.3 [CEO Dashboard](#53-ceo-dashboard)
6. [AI & Intelligence Layer](#6-ai--intelligence-layer)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Database Schema Overview](#8-database-schema-overview)
9. [Security & Access Control](#9-security--access-control)
10. [Escalation Logic](#10-escalation-logic)
11. [Financial Loss Module](#11-financial-loss-module)
12. [API Integration](#12-api-integration)
13. [UI/UX Requirements](#13-uiux-requirements)
14. [Constraints & Assumptions](#14-constraints--assumptions)
15. [Success Metrics](#15-success-metrics)
16. [Glossary](#16-glossary)

---

## 1. Project Overview

The **Customer Complaint Intelligence System (CCIS)** is a full-stack Management Information System (MIS) designed to transform fragmented, reactive complaint handling into a proactive, data-driven enterprise process.

**Demo Context**: For the purposes of development and demonstration, CCIS will be tailored to **AuraBank**, a fictional digital banking and financial services company. All seeded data, routing, and AI context will revolve around realistic banking scenarios (e.g., failed UPI transfers, blocked credit cards, hidden account fees, and mobile app crashes).

CCIS moves beyond a simple ticketing system. It integrates AI-powered classification, sentiment analysis, churn prediction, root-cause clustering, and financial impact analysis into a unified platform. The system is structured around three distinct portals tailored to three actors — **Customer**, **Employee**, and **CEO** — each with precisely scoped capabilities to ensure relevance without information overload.

### Problem Statement

Organizations today handle customer complaints in silos — emails, phone calls, spreadsheets — with no systemic intelligence. High-risk complaints go unnoticed, agents lack context, and executives see no aggregate pattern until damage is done. CCIS solves this by acting as the intelligent nerve center for all complaint data.

### Scope

| In Scope | Out of Scope |
|---|---|
| Web-based complaint submission | Mobile native app |
| AI classification & sentiment analysis | External ML model training (pre-trained models used) |
| Employee complaint resolution workspace | Multi-language support (v1) |
| CEO strategic dashboard | Admin panel / system settings |
| Financial impact module | Payment gateway / refund processing |
| Churn risk scoring | HR/payroll integration |
| API endpoints for external integration | Real-time chat / live support |
| Escalation workflows | Voice / phone complaint intake |

---

## 2. Objectives & Goals

### Primary Objectives

1. **Streamline Intake**: Provide a clean, guided complaint submission interface for customers.
2. **Accelerate Resolution**: Equip employees with AI-augmented context to resolve complaints faster.
3. **Enable Strategic Intelligence**: Give the CEO real-time visibility into KPIs, financial risk, and systemic patterns.
4. **Reduce Churn**: Proactively identify at-risk customers before they leave.
5. **Quantify Impact**: Attach financial loss estimates to every complaint for business impact tracking.

### Measurable Goals

| Goal | Target |
|---|---|
| AI classification accuracy | ≥ 90% |
| Average complaint resolution time | Reduce by 30% vs. manual baseline |
| Customer satisfaction (CSAT) post-resolution | ≥ 80% positive |
| Churn prediction model accuracy | ≥ 85% |
| System uptime | ≥ 99.5% |
| Effort estimate | 180 person-hours |
| Project critical path | 63 days |

---

## 3. Actors & Roles

> **Note**: This system is scoped to exactly **three actors**. No Admin or Manager role exists in this version.

### 3.1 Customer

**Who**: Any end-user who has a complaint against the organization's products or services.

**Goals**:
- Submit complaints quickly and without friction.
- Track the real-time status of submitted complaints.
- Receive automated self-help suggestions for common issues.
- Provide feedback after complaint resolution.

**Access**: Customer Portal only. No access to any internal data, dashboards, or other users' complaints.

---

### 3.2 Employee

**Who**: Internal staff assigned to handle complaints within a specific department (IT, Finance, Operations, etc.).

**Goals**:
- View and manage complaints assigned to them or their department.
- Leverage AI-generated summaries to quickly understand context.
- Update complaint status, add resolution notes, and communicate with the customer.
- Escalate complaints that exceed SLA or are high-risk.
- Track personal and departmental performance metrics.

**Access**: Employee Portal only. Row-Level Security (RLS) ensures each employee only sees complaints relevant to their department.

---

### 3.3 CEO

**Who**: The executive leadership who needs strategic oversight of the entire complaint ecosystem.

**Goals**:
- Monitor high-level KPIs across all departments.
- Identify systemic issues via root-cause clusters.
- Track financial impact of unresolved complaints.
- Monitor churn risk of flagged customers.
- Ask natural language questions via semantic search.
- Download executive reports.
- Access API integration management.

**Access**: CEO Dashboard (full read access across all complaints). API management panel.

---

### Actor vs. Feature Matrix

| Feature | Customer | Employee | CEO |
|---|---|---|---|
| Submit Complaint | ✅ | ❌ | ❌ |
| Track Own Complaint Status | ✅ | ❌ | ❌ |
| Receive Auto-Suggestions | ✅ | ❌ | ❌ |
| Provide Post-Resolution Feedback | ✅ | ❌ | ❌ |
| View Assigned Complaints | ❌ | ✅ | ❌ |
| View Department Complaints | ❌ | ✅ | ❌ |
| AI Summary & Sentiment (per ticket) | ❌ | ✅ | ❌ |
| Communicate with Customer | ❌ | ✅ | ❌ |
| Escalate Complaint | ❌ | ✅ | ❌ |
| Update Resolution Status | ❌ | ✅ | ❌ |
| Resolution Time Analytics | ❌ | ✅ (personal) | ✅ (all) |
| Strategic KPI Dashboard | ❌ | ❌ | ✅ |
| Root-Cause Clusters | ❌ | ❌ | ✅ |
| Churn Risk Scoring | ❌ | ❌ | ✅ |
| Financial Loss Analysis | ❌ | ❌ | ✅ |
| Semantic Search | ❌ | ❌ | ✅ |
| Download Executive Reports | ❌ | ❌ | ✅ |
| API Integration Management | ❌ | ❌ | ✅ |
| View All Escalated Complaints | ❌ | ❌ | ✅ |

---

## 4. System Architecture

### 4.1 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL + Auth + RLS) |
| AI / Intelligence | Python / TypeScript (Groq API, Llama Models, Agno for agents) |
| Deployment | Localhost only (No production deployment) |
| API Layer | Next.js API Routes + Supabase Functions |

### 4.2 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                  │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  Customer   │  │    Employee      │  │   CEO           │  │
│  │  Portal     │  │    Portal        │  │   Dashboard     │  │
│  └──────┬──────┘  └────────┬─────────┘  └────────┬────────┘  │
└─────────┼──────────────────┼─────────────────────┼───────────┘
          │                  │                     │
          ▼                  ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                         │
│   PostgreSQL DB │ Supabase Auth │ Row-Level Security (RLS)   │
│   Real-time Subscriptions │ Storage (Attachments)            │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                    AI / PYTHON LAYER                          │
│   LangChain │ Sentiment Analysis │ Classification            │
│   Churn Scoring │ Root-Cause Clustering │ Financial Estimate  │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Data Flow Summary

1. Customer submits complaint → stored in Supabase.
2. AI pipeline triggered → classifies category, detects sentiment, estimates financial impact.
3. Complaint routed to correct department based on classification.
4. Employee views complaint with AI context, resolves and updates status.
5. Escalation logic fires if SLA is breached or risk is high.
6. CEO dashboard aggregates data in real-time via Supabase queries.
7. External systems can push/pull data via exposed API endpoints.

---

## 5. Functional Requirements

### 5.1 Customer Portal

#### 5.1.1 Complaint Submission Form

The complaint form is the primary intake mechanism. It must be clean, guided, and friction-free.

**Form Fields**:

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | Text | ✅ | |
| Email Address | Email | ✅ | Used for status notifications |
| Phone Number | Tel | Optional | |
| Product / Service Involved | Dropdown | ✅ | Populated from database |
| Complaint Category | Dropdown | ✅ | Billing, Service, Product Quality, Delivery, Technical, Other |
| Complaint Description | Long Text | ✅ | Min 50 characters |
| Attachments | File Upload | Optional | Max 3 files, 5MB each |
| Preferred Resolution | Dropdown | ✅ | Refund, Replacement, Apology, Other |
| Estimated Financial Loss | Numeric | Optional | With guidance tooltip |
| Consent to Contact | Checkbox | ✅ | Required to submit |

**Behavior**:
- On submit: form validated client-side, then server-side.
- Complaint stored in Supabase with status `OPEN`.
- AI pipeline triggered asynchronously.
- Confirmation email sent to customer with complaint ID.

#### 5.1.2 Instant Resolution Suggestions

- Before submission, if the complaint description matches known patterns, the system suggests self-help articles or FAQs.
- Suggestions appear inline and do not block submission.
- If the customer resolves their issue via suggestion, they can dismiss the form — logged as a "deflected complaint."

#### 5.1.3 Complaint Tracking Dashboard

After submission, the customer can log in to track their complaint(s):

- **Timeline View**: Visual step-by-step tracker (Submitted → Under Review → Resolved / Escalated).
- **Status Badge**: Color-coded — Open (grey), In Progress (blue), Escalated (orange), Resolved (green), Closed (teal).
- **Last Updated**: Timestamp of the most recent action.
- **Communication Log**: Read-only view of messages sent by the employee to the customer.
- **Resolution Note**: What the employee resolved and how.

#### 5.1.4 Post-Resolution Feedback

- After status moves to `RESOLVED`, customer is prompted to rate their experience (1–5 stars).
- Optional text comment.
- Feedback stored and surfaced in CEO dashboard as CSAT metric.

---

### 5.2 Employee Portal

#### 5.2.1 Complaint Queue

The main view for an employee. Displays all complaints assigned to them or their department.

**Views Available**:
- **My Complaints**: Complaints explicitly assigned to the logged-in employee.
- **Department Queue**: All open complaints for the employee's department.
- **Escalated**: Complaints flagged as escalated (highlighted in orange).

**Filters & Sorting**:
- Filter by: Status, Category, Priority, Date Range, Escalation flag.
- Sort by: Date Submitted, Priority, Time Since Last Update.
- Search by: Complaint ID, Customer Name, Keywords in description.

**Table Columns**: Complaint ID | Customer Name | Category | Status | Priority | Assigned To | Submitted Date | SLA Deadline | Escalated?

#### 5.2.2 Complaint Detail View

Clicking a complaint opens the detail view.

**Sections**:

1. **Complaint Info**: All original form fields submitted by the customer.
2. **AI Intelligence Panel**:
   - Auto-generated summary of the complaint.
   - Detected sentiment (Positive / Neutral / Negative) with confidence score.
   - Urgency classification (Low / Medium / High / Critical).
   - Suggested response template.
3. **Financial Impact**: System-estimated or customer-reported financial loss.
4. **Communication Log**: Full thread of messages between employee and customer.
5. **Action Panel**:
   - Update Status (Open → In Progress → Resolved → Closed).
   - Add Internal Note (not visible to customer).
   - Send Message to Customer.
   - Escalate (with mandatory justification text).
   - Reassign (to another employee in same department).

#### 5.2.3 Employee Analytics

Personal performance dashboard:

| Metric | Description |
|---|---|
| Complaints Resolved | Count for selected period |
| Avg. Resolution Time | Hours/days per complaint |
| CSAT Score | Average customer feedback rating |
| Escalation Rate | % of complaints escalated |
| Complaint Volume by Category | Bar chart |
| SLA Adherence | % resolved before deadline |

#### 5.2.4 SLA & Priority Management

- Each complaint category has a default SLA (e.g., Billing = 24h, Technical = 48h).
- SLA countdown timer visible in complaint detail.
- Priority auto-calculated from: sentiment score + estimated financial loss + SLA remaining.
- Priority can be manually overridden by employee.

---

### 5.3 CEO Dashboard

#### 5.3.1 Strategic KPI Overview

Top-level metrics panel at the glance:

| KPI | Description |
|---|---|
| Total Active Complaints | Live count across all departments |
| Average Resolution Time | Org-wide average |
| Resolution Rate | % resolved in current month |
| Escalation Rate | % of complaints escalated |
| CSAT Score | Month-to-date weighted average |
| Total Financial Exposure | Sum of estimated losses on open complaints |
| Churn Risk Count | Customers flagged as high churn risk |

#### 5.3.2 Escalated Complaints Panel

- Real-time list of all currently escalated complaints across all departments.
- Sortable by escalation time, financial impact, department.
- CEO can add executive annotations (notes visible to employees handling the complaint).
- One-click to view full complaint detail.

#### 5.3.3 Root-Cause Clusters

AI-driven thematic clustering of complaints:
- Complaints grouped into systemic themes (e.g., "Billing errors after March update", "Slow delivery in Zone B").
- Each cluster shows complaint count, trend over time, total financial impact.
- Clicking a cluster shows the constituent complaints.

#### 5.3.4 Churn Risk Scoring

Customers flagged as high churn risk based on:
- Frequency of complaints in last 30/60/90 days.
- Negative sentiment score.
- Complaint language "heat" (strong emotional language).
- Unresolved complaint age.

**View**:
- Table of flagged customers with churn risk score (0–100).
- Color-coded: Low (green) / Medium (yellow) / High (red).
- Trend: Are more customers moving toward high risk?

#### 5.3.5 Financial Loss Analysis

- Total estimated financial exposure on open complaints.
- Category-wise breakdown (pie / bar chart).
- Trend over time (line chart — monthly).
- Top 10 highest-impact complaints highlighted.
- Comparison: customer-reported vs. AI-estimated losses.

#### 5.3.6 Semantic Search

Natural language query interface for deep investigation:

- Example queries:
  - *"What caused the most financial loss last month?"*
  - *"Which department has the highest escalation rate this quarter?"*
  - *"Show me all high-risk customers who complained about billing"*
- Query processed by LLM pipeline against complaint database.
- Results returned as natural language summary + supporting data table.

#### 5.3.7 Executive Reports

- One-click report generation covering any date range.
- Formats: PDF, CSV.
- Report includes: KPI summary, category breakdown, department performance, financial exposure, churn risk highlights, root-cause themes.

#### 5.3.8 API Integration Management

- View all active API integrations.
- Generate / revoke API keys.
- View usage analytics per key.
- Link to API documentation page (Ingestion API + Intelligence API).

---

## 6. AI & Intelligence Layer

### 6.1 Complaint Classification

- **Input**: Complaint description + category selected by customer.
- **Output**: Validated category, subcategory, urgency level (Low / Medium / High / Critical).
- **Model**: Llama model via Groq API.
- **Target Accuracy**: ≥ 90%.

### 6.2 Sentiment Analysis

- **Input**: Complaint description.
- **Output**: Sentiment label (Positive / Neutral / Negative) + confidence score (0–1).
- **Usage**: Affects priority score, churn risk score, escalation triggers.

### 6.3 AI Summary Generation

- **Input**: Full complaint description + metadata.
- **Output**: 2–3 sentence plain-English summary.
- **Purpose**: Allows employees to understand the complaint at a glance without reading the full text.

### 6.4 Suggested Response Templates

- **Input**: Complaint category + sentiment + urgency.
- **Output**: A suggested response template for the employee to send to the customer.
- **Purpose**: Reduces time-to-first-response and improves tone consistency.

### 6.5 Financial Loss Estimation

- **Input**: Complaint category, product involved, description.
- **Output**: Estimated monetary loss range (₹).
- **Usage**: When customer does not provide their own estimate.
- **Note**: Customer-provided estimates always override AI estimates.

### 6.6 Churn Risk Scoring

- **Input**: Customer complaint history (frequency, sentiment, age, language heat).
- **Output**: Churn risk score (0–100).
- **Threshold**: Score > 70 = flagged as "High Risk" on CEO dashboard.

### 6.7 Root-Cause Clustering

- **Input**: All complaint descriptions (batched).
- **Output**: Named clusters (themes) with associated complaints.
- **Algorithm**: LLM-assisted semantic clustering (embeddings + k-means or DBSCAN).
- **Refresh**: Daily batch job.

### 6.8 Semantic Search

- **Input**: Natural language query from CEO.
- **Output**: Summary response + supporting structured data.
- **Implementation**: Agno agent (or Groq tool calling) over complaint embeddings.

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement | Target |
|---|---|
| Page load time | < 2 seconds |
| Complaint submission response | < 1 second |
| AI pipeline (async) | Complete within 30 seconds |
| Dashboard data refresh | Real-time (Supabase subscriptions) |
| Semantic search response | < 5 seconds |
| API response time | < 500ms |

### 7.2 Availability

- System uptime: ≥ 99.5%.
- Graceful degradation: If AI layer is unavailable, complaint is stored and retried — core submission flow is never blocked.

### 7.3 Scalability

- Support up to 10,000 complaints per month in v1.
- Supabase auto-scales; AI layer scaled via Python worker queue.

### 7.4 Security

- All data encrypted at rest (Supabase default AES-256) and in transit (HTTPS/TLS).
- Authentication via Supabase Auth (JWT tokens).
- Row-Level Security (RLS) enforced at database level — not just application level.
- API keys rotatable at any time.
- Audit logs for all employee and CEO actions.

### 7.5 Accessibility

- WCAG 2.1 AA compliant UI.
- Keyboard navigable.
- Screen reader compatible.
- Responsive design (mobile and desktop).

---

## 8. Database Schema Overview

### 8.1 Database Seeding & Environment Setup

To ensure a centralized data store and realistic demonstration environment:
- **Environment Variables**: An `.env.local` file must be used to centralize connection details. It will store the Supabase URI string (`NEXT_PUBLIC_SUPABASE_URL`) and necessary keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- **Seeding Script**: A robust `seed.sql` or `seed.ts` data generation script must be created. This script will build the schema and populate the system with realistic dummy data tailored specifically to the **AuraBank** use case, ensuring all dashboards are populated with meaningful information from day one.

### 8.2 Core Tables

**complaints**
```
id, created_at, updated_at, customer_id, category, subcategory,
description, attachment_urls, preferred_resolution, financial_loss_customer,
financial_loss_ai, status, priority, department, assigned_to,
sla_deadline, escalated, escalation_reason, resolution_note, feedback_rating, feedback_text
```

**customers**
```
id, created_at, name, email, phone, churn_risk_score, complaint_count
```

**employees**
```
id, created_at, name, email, department, role
```

**messages** (complaint communication log)
```
id, created_at, complaint_id, sender_id, sender_role, message_text, visible_to_customer
```

**ai_analyses**
```
id, created_at, complaint_id, sentiment, sentiment_score, urgency,
classification, summary, suggested_response, financial_loss_estimate, embedding
```

**clusters** (root-cause themes)
```
id, created_at, label, complaint_ids, total_complaints, financial_impact, trend_data
```

**audit_logs**
```
id, created_at, actor_id, actor_role, action, resource_type, resource_id, metadata
```

**api_keys**
```
id, created_at, key_hash, label, created_by, last_used, usage_count, active
```

---

## 9. Security & Access Control

### 9.1 Authentication

- All three portals require authenticated sessions.
- Customer: email + password (or magic link).
- Employee: email + password (managed by organization).
- CEO: email + password + optional 2FA.
- Session timeout: 8 hours (employees/CEO), 24 hours (customers).

### 9.2 Row-Level Security (RLS) Policies

| Table | Customer | Employee | CEO |
|---|---|---|---|
| complaints | Own rows only | Department rows only | All rows |
| messages | Own complaint messages only | Assigned complaints | All |
| ai_analyses | None | Assigned complaints | All |
| clusters | None | None | All |
| audit_logs | None | None | All |
| api_keys | None | None | All |

### 9.3 Audit Logging

All of the following actions are logged with actor, timestamp, and resource:
- Complaint status change
- Escalation
- Message sent to customer
- CEO dashboard export
- API key creation / revocation
- Semantic search queries

---

## 10. Escalation Logic

### 10.1 Automatic Escalation Triggers

A complaint is auto-escalated when **any** of the following conditions are met:
- Complaint has not moved from `OPEN` to `IN PROGRESS` within 4 hours.
- SLA deadline exceeded with status not `RESOLVED`.
- Sentiment score is Negative AND financial loss estimate exceeds ₹10,000.
- Urgency classified as `CRITICAL` by AI.
- Churn risk score of the complaining customer > 80.

### 10.2 Manual Escalation

- Any employee can escalate any complaint assigned to their department.
- Mandatory justification text required.
- Escalated complaints:
  - Appear in CEO's Escalated Complaints panel immediately.
  - Assigned employee receives a notification.

### 10.3 Post-Escalation

- CEO can annotate escalated complaints.
- Annotations are visible to the assigned employee.
- CEO cannot directly change status (resolution remains employee responsibility).

---

## 11. Financial Loss Module

### 11.1 Data Sources

- **Customer Self-Report**: Optional field in complaint form.
- **AI Estimation**: Python model estimates based on category, product, and description keywords. Applied when customer does not provide a value.

### 11.2 Aggregation & Display

| View | Metric Shown |
|---|---|
| CEO KPI Bar | Total financial exposure (all open complaints) |
| CEO Financial Chart | Category-wise breakdown (pie + bar) |
| CEO Trend Chart | Monthly financial exposure (line chart) |
| CEO Top Complaints | Top 10 individual complaints by financial impact |
| Complaint Detail (Employee) | Per-complaint financial impact figure |

### 11.3 Rules

- Customer-provided value always takes precedence over AI estimate.
- AI estimate is displayed with a "~" (estimated) label.
- Financial impact included in exported executive reports.

---

## 12. API Integration

### 12.1 Ingestion API

**Purpose**: External systems (CRM, mobile apps) can push complaints into CCIS.

**Endpoint**: `POST /api/v1/complaints/ingest`

**Auth**: API key in header.

**Payload**: Same fields as the complaint form (name, email, category, description, etc.).

**Response**: Complaint ID + status.

### 12.2 Intelligence API

**Purpose**: External systems can request AI insights about a specific customer or complaint.

**Endpoints**:
- `GET /api/v1/intelligence/sentiment?complaint_id=...`
- `GET /api/v1/intelligence/churn-risk?customer_id=...`

**Auth**: API key in header.

**Response**: JSON with sentiment label, score, and churn risk score.

### 12.3 API Management

- API keys generated and managed via CEO Dashboard.
- Each key has a label, usage count, last-used timestamp.
- Keys can be revoked at any time.
- Rate limiting: 1000 requests per key per day (v1).

---

## 13. UI/UX Requirements

### 13.1 Design System

- **Typography**: Inter (Google Fonts).
- **Color Palette**: Neutral dark-mode base with accent colors per portal (Customer: Blue, Employee: Indigo, CEO: Violet/Purple).
- **Components**: Radix UI primitives styled with Tailwind CSS.
- **Icons**: Lucide React.

### 13.2 Portal-Level UX Requirements

**Customer Portal**:
- Clean, minimal, low-cognitive-load design.
- Step-by-step complaint form (multi-step wizard optional).
- Mobile-first responsive layout.

**Employee Portal**:
- Dense information layout (data tables, sidebars).
- Keyboard shortcut support for power users.
- Notification system for new assignments and escalations.

**CEO Dashboard**:
- Card-based KPI layout at top.
- Rich data visualizations (charts, cluster maps, risk tables).
- Sticky navigation for quick section jumps.
- Dark mode by default.

### 13.3 Notifications

| Event | Customer | Employee | CEO |
|---|---|---|---|
| Complaint submitted confirmation | ✅ Email | — | — |
| Status changed | ✅ Email | — | — |
| Message received | ✅ Email | ✅ In-app | — |
| Escalation triggered | — | ✅ In-app | ✅ In-app |
| SLA breach warning (1h before) | — | ✅ In-app | — |
| New high-churn customer flagged | — | — | ✅ In-app |

---

## 14. Constraints & Assumptions

### Constraints

- **Time**: Project estimated at 180 person-hours over a 63-day critical path.
- **Cost**: Prototype budget ≈ ₹31,050.
- **AI Accuracy**: Target ≥ 90%; lower accuracy will trigger human review fallback.
- **v1 Scale**: Designed for up to 10,000 complaints/month.

### Assumptions

- All users have access to modern browsers (Chrome, Firefox, Safari, Edge).
- Organization has at least one department mapped per complaint category.
- Groq API is available for fast Llama model inference.
- Supabase free/pro tier is sufficient for v1.
- Emails are sent via Supabase or Resend.dev integration.
- Financial loss estimates are approximate and for internal analytics only — not legal commitments.

---

## 15. Success Metrics

| Metric | Measurement Method | Target |
|---|---|---|
| AI classification accuracy | Manual review of 100 random complaints / month | ≥ 90% |
| Average resolution time | Supabase query: avg(resolved_at - created_at) | Reduce by 30% |
| CSAT score | Average of feedback_rating field | ≥ 4.0 / 5.0 |
| Churn prediction accuracy | Retrospective: did flagged customers actually churn? | ≥ 85% |
| Complaint deflection rate | Count of dismissed self-help suggestions / total submissions | Track & optimize |
| Financial exposure reduction | Monthly trend of total financial_loss on open complaints | Downward trend |
| System uptime | Localhost + Supabase monitoring | N/A (Local) |

---

## 16. Glossary

| Term | Definition |
|---|---|
| CCIS | Customer Complaint Intelligence System |
| MIS | Management Information System |
| EIS | Enterprise Information System |
| RLS | Row-Level Security (Supabase/PostgreSQL feature) |
| SLA | Service Level Agreement — time limit to resolve a complaint |
| CSAT | Customer Satisfaction Score |
| Churn Risk | Probability a customer will stop using the product/service |
| Root-Cause Cluster | AI-grouped theme of complaints sharing a common cause |
| Escalation | Forwarding a complaint to a higher authority (CEO view) due to urgency or SLA breach |
| Sentiment | Emotional tone of the complaint text (Positive / Neutral / Negative) |
| AI Sidekick | The AI Intelligence Panel visible to employees in the complaint detail view |
| LangChain | Python framework for building LLM-powered applications |
| Semantic Search | Natural language search powered by LLM and vector embeddings |

---

*End of PRD — CCIS v1.0*
