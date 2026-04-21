# Lovable Prompt: AuraBank Customer Complaint Intelligence System (CCIS)

Copy and paste the following prompt into Lovable to generate the entire Next.js application frontend.

---

**Project Name**: AuraBank CCIS (Customer Complaint Intelligence System)
**Stack**: Next.js 14 (App Router), Tailwind CSS, TypeScript, `lucide-react` for icons, Supabase (for Auth and Database).
**Design Aesthetic**: Modern, premium dark mode. Glassmorphism, subtle glowing borders. Very high-end banking/fintech feel.

## Overview
I am building a comprehensive Customer Complaint Intelligence System for a digital bank ("AuraBank"). The system has three distinct portals governed by role-based access:
1. **Customer Portal** (Blue accents)
2. **Employee/Agent Portal** (Indigo accents)
3. **CEO Dashboard** (Violet accents)

Please generate the complete UI structure, including a landing page, a unified login page, and the layout shells and dashboard placeholders for all three portals.

## Global Design System
- **Background**: Deep dark blue/black (`#0a0b0f` or `bg-slate-950`). Surface elements slightly lighter (`#131520`).
- **Typography**: Inter font. Clean, highly legible.
- **Accents**: 
  - Customer components should use Blue (`blue-500` to `blue-600`).
  - Employee components should use Indigo (`indigo-500` to `indigo-600`).
  - CEO components should use Violet (`violet-500` to `violet-600`).
- **Components Needed**:
  - Reusable `Card` with glassmorphic styling and portal-specific accent borders.
  - Reusable `Button` supporting primary, secondary, and ghost variants.
  - Reusable `Badge` for Status (Open, In Progress, Escalated, Resolved) and Priority (Low, Medium, High, Critical).
  - Modern `Input` and `Textarea` fields.
- **Animations**: Subtle fade-ins, gentle hover states, glowing focus rings on inputs.

## Pages to Generate

### 1. Landing Page (`/`)
- A stunning hero section introducing "AuraBank CCIS".
- Large, bold typography with a gradient text effect.
- Three prominent entry cards/buttons directing to the respective portals (Customer, Employee, CEO).
- A section below highlighting "Platform Capabilities" using small pill badges (e.g., AI Classification, Root Cause Clusters, Churn Risk Detection).

### 2. Unified Login Page (`/login`)
- A centered, clean login card on a dark ambient background.
- Email and Password inputs.
- A "Sign In" button.
- IMPORTANT: Below the login form, include a "Demo Credentials" section with 3 quick-fill buttons that auto-fill the form for Customer, Employee, and CEO roles.

### 3. Customer Portal Shell (`/customer`)
- **Layout**: Fixed left sidebar (Blue accent active states) and top navbar.
- **Navbar**: Shows "AuraBank Support" and a notification bell.
- **Sidebar Links**: Dashboard, My Complaints, Settings, Sign Out.
- **Dashboard Page**: 
  - A welcome banner.
  - 3 quick stat cards: "Open Complaints", "In Progress", "Resolved".
  - A prominent "Submit New Complaint" button.

### 4. Employee Portal Shell (`/employee`)
- **Layout**: Fixed left sidebar (Indigo accent active states) and top navbar.
- **Navbar**: Shows "CCIS Employee Portal".
- **Sidebar Links**: Dashboard, Complaint Queue, Analytics, Notifications, Settings, Sign Out.
- **Dashboard Page**:
  - A welcome banner for the Agent.
  - 4 quick stat cards: "Assigned To You", "Open in Department", "Escalated", "Resolved Today".

### 5. CEO Dashboard Shell (`/ceo`)
- **Layout**: Fixed left sidebar (Violet accent active states) and top navbar.
- **Navbar**: Shows "Executive Command Center".
- **Sidebar Links**: Dashboard, Escalations, Clusters, Churn Risk, Financial Loss, Analytics, Semantic Search, API Keys, Sign Out.
- **Dashboard Page**:
  - A strategic hero banner.
  - A grid of 6 KPI Cards: "Total Complaints", "Escalated", "High Churn Customers", "Financial Exposure", "Root Cause Clusters", "Avg Resolution Time".

## Technical Requirements for Lovable
- Ensure all pages are responsive (mobile-friendly sidebars that convert to hamburger menus).
- Mock the routing (use standard Next.js `<Link>` components).
- Do not build actual Supabase database fetching logic yet; rely on static mock data to make the UI look perfect and populated. I will wire up Supabase myself later.
- Focus purely on making the UI look incredible, using Tailwind exclusively. Keep components modular.
